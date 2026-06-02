package com.rms.backend.service.impl;
import com.rms.backend.dto.request.LoginRequest;
import com.rms.backend.dto.request.RegisterRequest;
import com.rms.backend.dto.response.AuthResponse;
import com.rms.backend.entity.User;
import com.rms.backend.exception.BadRequestException;
import com.rms.backend.repository.UserRepository;
import com.rms.backend.security.service.JwtService;
import com.rms.backend.service.AuthService;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new BadRequestException("Email already registered: " + req.getEmail());
        User user = User.builder()
            .fullName(req.getFullName()).email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .phone(req.getPhone()).role(User.Role.CUSTOMER).isActive(true).build();
        userRepository.save(user);
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.of(user.getId(), accessToken, refreshToken, user.getFullName(), user.getEmail(), user.getRole().name(), permissionsOf(user));
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new BadRequestException("User not found"));
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.of(user.getId(), accessToken, refreshToken, user.getFullName(), user.getEmail(), user.getRole().name(), permissionsOf(user));
    }

    private Set<String> permissionsOf(User user) {
        if (user.getRole() == User.Role.ADMIN) {
            return Arrays.stream(User.Permission.values()).map(Enum::name).collect(Collectors.toSet());
        }
        return user.getPermissions() == null
                ? Set.of()
                : user.getPermissions().stream().map(Enum::name).collect(Collectors.toSet());
    }
}
