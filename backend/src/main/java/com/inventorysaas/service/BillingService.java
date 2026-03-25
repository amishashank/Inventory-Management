package com.inventorysaas.service;

import com.inventorysaas.dto.BillItemRequest;
import com.inventorysaas.dto.BillRequest;
import com.inventorysaas.entity.*;
import com.inventorysaas.exception.BadRequestException;
import com.inventorysaas.exception.ResourceNotFoundException;
import com.inventorysaas.repository.BillRepository;
import com.inventorysaas.repository.DiscountSchemeRepository;
import com.inventorysaas.repository.ProductRepository;
import com.inventorysaas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final DiscountSchemeRepository discountRepository;
    private final UserRepository userRepository;

    public List<Bill> getBills(Long userId) {
        return billRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Bill getBillById(Long id, Long userId) {
        return billRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
    }

    @Transactional
    public Bill createBill(BillRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<DiscountScheme> activeSchemes = discountRepository.findActiveSchemes(userId, LocalDate.now());

        Bill bill = Bill.builder()
                .billNumber(generateBillNumber(userId))
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .paymentMethod(request.getPaymentMethod())
                .user(user)
                .items(new ArrayList<>())
                .subtotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (BillItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findByIdAndUserId(itemRequest.getProductId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemRequest.getProductId()));

            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName()
                        + ". Available: " + product.getQuantity());
            }

            BigDecimal lineSubtotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            BigDecimal itemDiscount = calculateDiscount(product, lineSubtotal, activeSchemes);

            BillItem billItem = BillItem.builder()
                    .bill(bill)
                    .productId(product.getId())
                    .productName(product.getName())
                    .productSku(product.getSku())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice())
                    .discountApplied(itemDiscount)
                    .lineTotal(lineSubtotal.subtract(itemDiscount))
                    .build();

            bill.getItems().add(billItem);
            subtotal = subtotal.add(lineSubtotal);
            totalDiscount = totalDiscount.add(itemDiscount);

            // Deduct stock
            product.setQuantity(product.getQuantity() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        BigDecimal taxPercentage = request.getTaxPercentage() != null ? request.getTaxPercentage() : BigDecimal.ZERO;
        BigDecimal taxableAmount = subtotal.subtract(totalDiscount);
        BigDecimal taxAmount = taxableAmount.multiply(taxPercentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        bill.setSubtotal(subtotal);
        bill.setDiscountAmount(totalDiscount);
        bill.setTaxPercentage(taxPercentage);
        bill.setTaxAmount(taxAmount);
        bill.setTotalAmount(taxableAmount.add(taxAmount));

        return billRepository.save(bill);
    }

    private BigDecimal calculateDiscount(Product product, BigDecimal lineTotal, List<DiscountScheme> schemes) {
        BigDecimal maxDiscount = BigDecimal.ZERO;

        for (DiscountScheme scheme : schemes) {
            // Check if scheme applies to this product's category
            if (scheme.getApplicableCategory() != null
                    && product.getCategory() != null
                    && !scheme.getApplicableCategory().getId().equals(product.getCategory().getId())) {
                continue;
            }

            // Check min purchase
            if (scheme.getMinPurchaseAmount() != null
                    && lineTotal.compareTo(scheme.getMinPurchaseAmount()) < 0) {
                continue;
            }

            BigDecimal discount = BigDecimal.ZERO;
            switch (scheme.getDiscountType()) {
                case PERCENTAGE:
                    discount = lineTotal.multiply(scheme.getValue())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    break;
                case FLAT:
                    discount = scheme.getValue().min(lineTotal);
                    break;
                case BUY_ONE_GET_ONE:
                    // BOGO: discount = price of one item (floor division for pairs)
                    discount = product.getPrice();
                    break;
            }

            if (discount.compareTo(maxDiscount) > 0) {
                maxDiscount = discount;
            }
        }

        return maxDiscount;
    }

    private String generateBillNumber(Long userId) {
        long count = billRepository.countByUserId(userId) + 1;
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "INV-" + userId + "-" + date + "-" + String.format("%04d", count);
    }
}
