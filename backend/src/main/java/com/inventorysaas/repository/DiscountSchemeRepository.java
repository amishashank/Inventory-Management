package com.inventorysaas.repository;

import com.inventorysaas.entity.DiscountScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DiscountSchemeRepository extends JpaRepository<DiscountScheme, Long> {
    List<DiscountScheme> findByUserId(Long userId);
    Optional<DiscountScheme> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT d FROM DiscountScheme d WHERE d.user.id = :userId AND d.active = true AND d.startDate <= :today AND d.endDate >= :today")
    List<DiscountScheme> findActiveSchemes(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(d) FROM DiscountScheme d WHERE d.user.id = :userId AND d.active = true AND d.startDate <= :today AND d.endDate >= :today")
    long countActiveSchemes(@Param("userId") Long userId, @Param("today") LocalDate today);
}
