package com.inventorysaas.repository;

import com.inventorysaas.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUserId(Long userId);
    Optional<Product> findByIdAndUserId(Long id, Long userId);
    List<Product> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @Query("SELECT DISTINCT p FROM Product p JOIN ProductStock ps ON p.id = ps.product.id WHERE p.user.id = :userId AND ps.quantity <= ps.reorderLevel")
    List<Product> findLowStockProducts(@Param("userId") Long userId);

    @Query("SELECT p FROM Product p WHERE p.user.id = :userId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> searchProducts(@Param("userId") Long userId, @Param("search") String search);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(DISTINCT p) FROM Product p JOIN ProductStock ps ON p.id = ps.product.id WHERE p.user.id = :userId AND ps.quantity <= ps.reorderLevel")
    long countLowStockByUserId(@Param("userId") Long userId);
}
