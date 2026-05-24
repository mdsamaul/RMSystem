package com.rms.backend.service;

import java.util.List;

import com.rms.backend.dto.response.UserResponse;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse getProfile(String email);
    void toggleUserStatus(Long id);
}
