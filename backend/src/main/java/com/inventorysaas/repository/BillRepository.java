package com.inventorysaas.repository;

import com.inventorysaas.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Bill> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.user.id = :userId AND b.createdAt >= :start AND b.createdAt < :end")
    BigDecimal sumRevenueByUserIdAndDateRange(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.user.id = :userId")
    BigDecimal sumTotalRevenueByUserId(@Param("userId") Long userId);
}
