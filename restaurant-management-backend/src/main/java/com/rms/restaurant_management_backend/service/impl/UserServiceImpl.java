package com.rms.restaurant_management_backend.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rms.restaurant_management_backend.dto.response.UserResponse;
import com.rms.restaurant_management_backend.repository.UserRepository;
import com.rms.restaurant_management_backend.service.UserService;

import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor @Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

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

}
