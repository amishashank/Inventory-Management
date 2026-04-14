package com.inventorysaas.controller;

import com.inventorysaas.entity.Outlet;
import com.inventorysaas.entity.User;
import com.inventorysaas.repository.OutletRepository;
import com.inventorysaas.repository.UserRepository;
import com.inventorysaas.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/outlets")
@RequiredArgsConstructor
public class OutletController {

    private final OutletRepository outletRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Outlet>> getOutlets(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(outletRepository.findByOwnerId(userId));
    }
    
    @PostMapping
    @Transactional
    public ResponseEntity<Outlet> createOutlet(@Valid @RequestBody Outlet outletDto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
        Outlet outlet = new Outlet();
        outlet.setName(outletDto.getName());
        outlet.setAddress(outletDto.getAddress());
        outlet.setPhone(outletDto.getPhone());
        outlet.setOwner(owner);
        
        return ResponseEntity.ok(outletRepository.save(outlet));
    }
}
