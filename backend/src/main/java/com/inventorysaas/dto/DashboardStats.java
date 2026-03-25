package com.inventorysaas.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardStats {
    private long totalProducts;
    private long lowStockProducts;
    private long activeSchemes;
    private long totalBills;
    private BigDecimal todayRevenue;
    private BigDecimal totalRevenue;
}
