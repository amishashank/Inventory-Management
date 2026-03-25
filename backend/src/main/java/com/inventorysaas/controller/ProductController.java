package com.inventorysaas.controller;

import com.inventorysaas.dto.ProductDTO;
import com.inventorysaas.entity.Product;
import com.inventorysaas.service.InventoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Product>> getAll(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.getProducts(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.getProductById(id, userId));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable Long categoryId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.getProductsByCategory(categoryId, userId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStock(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.getLowStockProducts(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> search(@RequestParam String q, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.searchProducts(q, userId));
    }

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody ProductDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.createProduct(dto, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @Valid @RequestBody ProductDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(inventoryService.updateProduct(id, dto, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        inventoryService.deleteProduct(id, userId);
        return ResponseEntity.noContent().build();
    }
}
