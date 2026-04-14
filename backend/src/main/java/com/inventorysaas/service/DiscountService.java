package com.inventorysaas.service;

import com.inventorysaas.dto.DiscountSchemeDTO;
import com.inventorysaas.entity.Category;
import com.inventorysaas.entity.DiscountScheme;
import com.inventorysaas.entity.User;
import com.inventorysaas.exception.BadRequestException;
import com.inventorysaas.exception.ResourceNotFoundException;
import com.inventorysaas.repository.CategoryRepository;
import com.inventorysaas.repository.DiscountSchemeRepository;
import com.inventorysaas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DiscountService {

    private final DiscountSchemeRepository discountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<DiscountScheme> getAllSchemes(Long userId) {
        return discountRepository.findByUserId(userId);
    }

    public DiscountScheme getSchemeById(Long id, Long userId) {
        return discountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount scheme not found"));
    }

    public List<DiscountScheme> getActiveSchemes(Long userId) {
        return discountRepository.findActiveSchemes(userId, LocalDate.now());
    }

    @Transactional
    public DiscountScheme createScheme(DiscountSchemeDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        DiscountScheme scheme = DiscountScheme.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .discountType(DiscountScheme.DiscountType.valueOf(dto.getDiscountType()))
                .value(dto.getValue())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .minPurchaseAmount(dto.getMinPurchaseAmount())
                .active(dto.isActive())
                .user(user)
                .build();

        if (dto.getApplicableCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(dto.getApplicableCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            scheme.setApplicableCategory(category);
        }

        return discountRepository.save(scheme);
    }

    @Transactional
    public DiscountScheme updateScheme(Long id, DiscountSchemeDTO dto, Long userId) {
        DiscountScheme scheme = getSchemeById(id, userId);

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        scheme.setName(dto.getName());
        scheme.setDescription(dto.getDescription());
        scheme.setDiscountType(DiscountScheme.DiscountType.valueOf(dto.getDiscountType()));
        scheme.setValue(dto.getValue());
        scheme.setStartDate(dto.getStartDate());
        scheme.setEndDate(dto.getEndDate());
        scheme.setMinPurchaseAmount(dto.getMinPurchaseAmount());
        scheme.setActive(dto.isActive());

        if (dto.getApplicableCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(dto.getApplicableCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            scheme.setApplicableCategory(category);
        } else {
            scheme.setApplicableCategory(null);
        }

        return discountRepository.save(scheme);
    }

    @Transactional
    public void deleteScheme(Long id, Long userId) {
        DiscountScheme scheme = getSchemeById(id, userId);
        discountRepository.delete(scheme);
    }
}
