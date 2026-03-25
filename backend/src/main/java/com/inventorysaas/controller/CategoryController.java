package com.inventorysaas.controller;

import com.inventorysaas.entity.Category;
import com.inventorysaas.service.InventoryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAll(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.getCategories(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.getCategoryById(id, userId));
    }

    @PostMapping
    public ResponseEntity<Category> create(@RequestBody Category category, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.createCategory(category, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category category, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.updateCategory(id, category, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        inventoryService.deleteCategory(id, userId);
        return ResponseEntity.noContent().build();
    }
}
