package com.rms.backend.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rms.backend.dto.request.LoginRequest;
import com.rms.backend.dto.request.RegisterRequest;
import com.rms.backend.dto.response.AuthResponse;
import com.rms.backend.entity.User;
import com.rms.backend.exception.BadRequestException;
import com.rms.backend.repository.UserRepository;
import com.rms.backend.security.service.JwtService;
import com.rms.backend.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class AuthServiceImpl  implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
       if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already in use"+request.getEmail());
        User user = User.builder().fullName(request.getFullName()).email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword())).phone(request.getPhone())
            .role(User.Role.CUSTOMER).isActive(true).build();
        userRepository.save(user);
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
       return AuthResponse.of(accessToken, refreshToken, user.getFullName(), user.getEmail(), user.getRole().name());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!user.getIsActive()) throw new BadRequestException("User account is deactivated");
        authenticationManager.authenticate(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
            request.getEmail(), request.getPassword()));
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.of(accessToken, refreshToken, user.getFullName(), user.getEmail(), user.getRole().name());
    }
     
}
