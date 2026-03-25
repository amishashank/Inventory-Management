package com.inventorysaas.service;

import com.inventorysaas.dto.ProductDTO;
import com.inventorysaas.entity.Category;
import com.inventorysaas.entity.Product;
import com.inventorysaas.entity.User;
import com.inventorysaas.exception.ResourceNotFoundException;
import com.inventorysaas.repository.CategoryRepository;
import com.inventorysaas.repository.ProductRepository;
import com.inventorysaas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    // ==================== Categories ====================

    public List<Category> getCategories(Long userId) {
        return categoryRepository.findByUserId(userId);
    }

    public Category getCategoryById(Long id, Long userId) {
        return categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    @Transactional
    public Category createCategory(Category category, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        category.setUser(user);
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category updated, Long userId) {
        Category category = getCategoryById(id, userId);
        category.setName(updated.getName());
        category.setDescription(updated.getDescription());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id, Long userId) {
        Category category = getCategoryById(id, userId);
        categoryRepository.delete(category);
    }

    // ==================== Products ====================

    public List<Product> getProducts(Long userId) {
        return productRepository.findByUserId(userId);
    }

    public Product getProductById(Long id, Long userId) {
        return productRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public List<Product> getProductsByCategory(Long categoryId, Long userId) {
        return productRepository.findByUserIdAndCategoryId(userId, categoryId);
    }

    public List<Product> getLowStockProducts(Long userId) {
        return productRepository.findLowStockProducts(userId);
    }

    public List<Product> searchProducts(String search, Long userId) {
        return productRepository.searchProducts(userId, search);
    }

    @Transactional
    public Product createProduct(ProductDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = Product.builder()
                .name(dto.getName())
                .sku(dto.getSku())
                .price(dto.getPrice())
                .costPrice(dto.getCostPrice())
                .quantity(dto.getQuantity())
                .reorderLevel(dto.getReorderLevel())
                .unit(dto.getUnit())
                .description(dto.getDescription())
                .user(user)
                .build();

        if (dto.getCategoryId() != null) {
            Category category = getCategoryById(dto.getCategoryId(), userId);
            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductDTO dto, Long userId) {
        Product product = getProductById(id, userId);
        product.setName(dto.getName());
        product.setSku(dto.getSku());
        product.setPrice(dto.getPrice());
        product.setCostPrice(dto.getCostPrice());
        product.setQuantity(dto.getQuantity());
        product.setReorderLevel(dto.getReorderLevel());
        product.setUnit(dto.getUnit());
        product.setDescription(dto.getDescription());

        if (dto.getCategoryId() != null) {
            Category category = getCategoryById(dto.getCategoryId(), userId);
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id, Long userId) {
        Product product = getProductById(id, userId);
        productRepository.delete(product);
    }
}
