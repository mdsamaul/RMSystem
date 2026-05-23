package com.rms.restaurant_management_backend.service;

import java.util.List;

import com.rms.restaurant_management_backend.dto.response.UserResponse;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse getProfile(String email);
    void toggleUserStatus(Long id);
}
