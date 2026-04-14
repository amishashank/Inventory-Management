package com.inventorysaas.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductDTO {
    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    private String sku;

    private Long categoryId;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    private BigDecimal costPrice;

    private Integer quantity;

    private Integer reorderLevel;

    private String unit;

    private String description;

    private BigDecimal gstRate;
}
