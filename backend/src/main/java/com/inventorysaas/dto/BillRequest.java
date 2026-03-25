package com.inventorysaas.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class BillRequest {
    private String customerName;
    private String customerPhone;
    private String paymentMethod;
    private BigDecimal taxPercentage;

    @NotEmpty(message = "Bill must have at least one item")
    private List<BillItemRequest> items;
}
