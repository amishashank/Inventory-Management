package com.inventorysaas.service;

import com.inventorysaas.dto.*;
import com.inventorysaas.entity.User;
import com.inventorysaas.exception.BadRequestException;
import com.inventorysaas.repository.UserRepository;
import com.inventorysaas.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .shopName(request.getShopName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .shopName(user.getShopName())
                .userId(user.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .shopName(user.getShopName())
                .userId(user.getId())
                .build();
    }
}
