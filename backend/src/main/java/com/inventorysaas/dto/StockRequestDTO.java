package com.inventorysaas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockRequestDTO {
    @NotNull(message = "Outlet ID is required")
    private Long outletId;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;
}
