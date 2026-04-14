package com.inventorysaas.repository;

import com.inventorysaas.entity.ProductStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductStockRepository extends JpaRepository<ProductStock, Long> {
    List<ProductStock> findByOutletId(Long outletId);
    Optional<ProductStock> findByProductIdAndOutletId(Long productId, Long outletId);
    List<ProductStock> findByProductId(Long productId);
}
