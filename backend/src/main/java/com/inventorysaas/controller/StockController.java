package com.inventorysaas.controller;

import com.inventorysaas.dto.StockRequestDTO;
import com.inventorysaas.entity.ProductStock;
import com.inventorysaas.service.InventoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final InventoryService inventoryService;
    
    @PutMapping("/product/{productId}")
    public ResponseEntity<ProductStock> updateStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockRequestDTO requestBody,
            HttpServletRequest request) {
            
        Long userId = (Long) request.getAttribute("userId");
        // Inherit assigned outlet from employee token if forced, else use payload
        Object tokenOutletId = request.getAttribute("outletId");
        Long finalOutletId = tokenOutletId != null ? (Long) tokenOutletId : requestBody.getOutletId();
        
        return ResponseEntity.ok(inventoryService.updateStock(
                productId, 
                finalOutletId, 
                requestBody.getQuantity(), 
                requestBody.getReorderLevel(), 
                userId));
    }
}
