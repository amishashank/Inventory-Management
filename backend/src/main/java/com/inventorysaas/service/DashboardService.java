package com.inventorysaas.service;

import com.inventorysaas.dto.DashboardStats;
import com.inventorysaas.repository.BillRepository;
import com.inventorysaas.repository.DiscountSchemeRepository;
import com.inventorysaas.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final DiscountSchemeRepository discountRepository;
    private final BillRepository billRepository;

    public DashboardStats getStats(Long userId) {
        DashboardStats stats = new DashboardStats();
        stats.setTotalProducts(productRepository.countByUserId(userId));
        stats.setLowStockProducts(productRepository.countLowStockByUserId(userId));
        stats.setActiveSchemes(discountRepository.countActiveSchemes(userId, LocalDate.now()));
        stats.setTotalBills(billRepository.countByUserId(userId));

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        stats.setTodayRevenue(billRepository.sumRevenueByUserIdAndDateRange(userId, startOfDay, endOfDay));
        stats.setTotalRevenue(billRepository.sumTotalRevenueByUserId(userId));

        return stats;
    }
}
