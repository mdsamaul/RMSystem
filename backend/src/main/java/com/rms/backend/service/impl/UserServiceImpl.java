package com.rms.backend.service.impl;

import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rms.backend.dto.request.StaffUpdateRequest;
import com.rms.backend.dto.response.UserResponse;
import com.rms.backend.entity.User;
import com.rms.backend.exception.BadRequestException;
import com.rms.backend.repository.UserRepository;
import com.rms.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor @Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).collect(Collectors.toList());
    }
@Override @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userRepository.findById(id).map(UserResponse::from)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @Override @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        return userRepository.findByEmail(email).map(UserResponse::from)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    @Override public void toggleUserStatus(Long id) {
        var user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Override
    public UserResponse updateStaffPermissions(Long id, Set<User.Permission> permissions) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != User.Role.STAFF) {
            throw new BadRequestException("Permissions can only be assigned to staff users");
        }
        user.setPermissions(permissions == null ? new HashSet<>() : new HashSet<>(permissions));
        return UserResponse.from(userRepository.save(user));
    }

    @Override
    public UserResponse updateStaff(Long id, StaffUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != User.Role.STAFF) {
            throw new BadRequestException("Only staff users can be edited here");
        }

        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Email already registered: " + request.getEmail());
            }
        });

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setIsActive(request.getIsActive() == null ? Boolean.TRUE : request.getIsActive());
        user.setPermissions(request.getPermissions() == null ? new HashSet<>() : new HashSet<>(request.getPermissions()));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Override
    public UserResponse createStaff(StaffUpdateRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required for new staff");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.STAFF)
                .isActive(request.getIsActive() == null ? Boolean.TRUE : request.getIsActive())
                .permissions(request.getPermissions() == null ? new HashSet<>() : new HashSet<>(request.getPermissions()))
                .build();

        return UserResponse.from(userRepository.save(user));
    }

}
