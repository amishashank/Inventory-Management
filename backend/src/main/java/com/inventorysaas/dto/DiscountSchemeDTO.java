package com.inventorysaas.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DiscountSchemeDTO {
    private Long id;

    @NotBlank(message = "Scheme name is required")
    private String name;

    private String description;

    @NotBlank(message = "Discount type is required")
    private String discountType;

    @DecimalMin(value = "0.00", message = "Value must be non-negative")
    private BigDecimal value;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private BigDecimal minPurchaseAmount;

    private Long applicableCategoryId;

    private boolean active;
}
