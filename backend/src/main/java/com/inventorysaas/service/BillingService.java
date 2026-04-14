package com.inventorysaas.service;

import com.inventorysaas.dto.BillItemRequest;
import com.inventorysaas.dto.BillRequest;
import com.inventorysaas.entity.*;
import com.inventorysaas.exception.BadRequestException;
import com.inventorysaas.exception.ResourceNotFoundException;
import com.inventorysaas.repository.BillRepository;
import com.inventorysaas.repository.DiscountSchemeRepository;
import com.inventorysaas.repository.OutletRepository;
import com.inventorysaas.repository.ProductRepository;
import com.inventorysaas.repository.ProductStockRepository;
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
@SuppressWarnings("null")
public class BillingService {

    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final DiscountSchemeRepository discountRepository;
    private final UserRepository userRepository;
    private final ProductStockRepository productStockRepository;
    private final OutletRepository outletRepository;

    public List<Bill> getBills(Long userId, Long outletId) {
        if (outletId != null) {
            return billRepository.findAll().stream()
                .filter(b -> b.getOutlet() != null && b.getOutlet().getId().equals(outletId))
                .toList(); // Quick fix: need a custom query in repository, but fine for now.
        }
        return billRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Bill getBillById(Long id, Long userId) {
        return billRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
    }

    @Transactional
    public Bill createBill(BillRequest request, Long userId, Long outletId) {
        if (outletId == null) {
            throw new BadRequestException("Bills must be processed at a specific outlet.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Outlet outlet = outletRepository.findById(outletId)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found"));

        List<DiscountScheme> activeSchemes = discountRepository.findActiveSchemes(userId, LocalDate.now());

        Bill bill = Bill.builder()
                .billNumber(generateBillNumber(userId))
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .paymentMethod(request.getPaymentMethod())
                .user(user)
                .outlet(outlet)
                .items(new ArrayList<>())
                .subtotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (BillItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findByIdAndUserId(itemRequest.getProductId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemRequest.getProductId()));
                    
            ProductStock stock = productStockRepository.findByProductIdAndOutletId(product.getId(), outletId)
                    .orElseThrow(() -> new BadRequestException("Product " + product.getName() + " is not stocked at this outlet"));

            if (stock.getQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName()
                        + ". Available: " + stock.getQuantity());
            }

            BigDecimal lineSubtotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            BigDecimal itemDiscount = calculateDiscount(product, lineSubtotal, activeSchemes, itemRequest.getQuantity());

            BigDecimal taxableAmount = lineSubtotal.subtract(itemDiscount);
            BigDecimal itemGstRate = product.getGstRate() != null ? product.getGstRate() : new BigDecimal("18.00");
            
            BigDecimal itemTaxAmount = taxableAmount.multiply(itemGstRate)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal halfItemTax = itemTaxAmount.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);

            BillItem billItem = BillItem.builder()
                    .bill(bill)
                    .productId(product.getId())
                    .productName(product.getName())
                    .productSku(product.getSku())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice())
                    .discountApplied(itemDiscount)
                    .lineTotal(taxableAmount)
                    .gstRate(itemGstRate)
                    .cgstAmount(halfItemTax)
                    .sgstAmount(itemTaxAmount.subtract(halfItemTax))
                    .build();

            bill.getItems().add(billItem);
            subtotal = subtotal.add(lineSubtotal);
            totalDiscount = totalDiscount.add(itemDiscount);
            totalTax = totalTax.add(itemTaxAmount);

            // Deduct stock from the Outlet
            stock.setQuantity(stock.getQuantity() - itemRequest.getQuantity());
            productStockRepository.save(stock);
        }

        BigDecimal netTaxable = subtotal.subtract(totalDiscount);

        bill.setSubtotal(subtotal);
        bill.setDiscountAmount(totalDiscount);
        bill.setTaxPercentage(BigDecimal.ZERO); // Deprecated parameter logic
        bill.setTaxAmount(totalTax);
        bill.setTotalAmount(netTaxable.add(totalTax));

        return billRepository.save(bill);
    }

    private BigDecimal calculateDiscount(Product product, BigDecimal lineTotal, List<DiscountScheme> schemes, Integer quantity) {
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
                    if (quantity >= 2) {
                        int freeItems = quantity / 2;
                        discount = product.getPrice().multiply(BigDecimal.valueOf(freeItems));
                    }
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
