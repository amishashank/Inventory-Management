package com.inventorysaas.controller;

import com.inventorysaas.dto.BillRequest;
import com.inventorysaas.entity.Bill;
import com.inventorysaas.service.BillingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillingService billingService;

    @GetMapping
    public ResponseEntity<List<Bill>> getAll(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(billingService.getBills(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(billingService.getBillById(id, userId));
    }

    @PostMapping
    public ResponseEntity<Bill> create(@Valid @RequestBody BillRequest billRequest, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(billingService.createBill(billRequest, userId));
    }
}
