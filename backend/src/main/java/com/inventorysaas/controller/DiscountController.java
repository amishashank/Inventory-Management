package com.inventorysaas.controller;

import com.inventorysaas.dto.DiscountSchemeDTO;
import com.inventorysaas.entity.DiscountScheme;
import com.inventorysaas.service.DiscountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @GetMapping
    public ResponseEntity<List<DiscountScheme>> getAll(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(discountService.getAllSchemes(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscountScheme> getById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(discountService.getSchemeById(id, userId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<DiscountScheme>> getActive(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(discountService.getActiveSchemes(userId));
    }

    @PostMapping
    public ResponseEntity<DiscountScheme> create(@Valid @RequestBody DiscountSchemeDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(discountService.createScheme(dto, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountScheme> update(@PathVariable Long id, @Valid @RequestBody DiscountSchemeDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(discountService.updateScheme(id, dto, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        discountService.deleteScheme(id, userId);
        return ResponseEntity.noContent().build();
    }
}
