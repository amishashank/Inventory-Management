package com.inventorysaas.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "discount_schemes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountScheme {

    public enum DiscountType {
        PERCENTAGE, FLAT, BUY_ONE_GET_ONE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(precision = 12, scale = 2)
    private BigDecimal value;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(precision = 12, scale = 2)
    private BigDecimal minPurchaseAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicable_category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category applicableCategory;

    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
