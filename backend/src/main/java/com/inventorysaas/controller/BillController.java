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

    private Long getOutletId(HttpServletRequest request) {
        Object outletId = request.getAttribute("outletId");
        if (outletId != null) return (Long) outletId;
        String outletParam = request.getParameter("outletId");
        if (outletParam != null && !outletParam.isEmpty() && !outletParam.equals("all")) {
            return Long.parseLong(outletParam);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getAll(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long outletId = getOutletId(request);
        return ResponseEntity.ok(billingService.getBills(userId, outletId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(billingService.getBillById(id, userId));
    }

    @PostMapping
    public ResponseEntity<Bill> create(@Valid @RequestBody BillRequest billRequest, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long outletId = getOutletId(request);
        return ResponseEntity.ok(billingService.createBill(billRequest, userId, outletId));
    }
}
