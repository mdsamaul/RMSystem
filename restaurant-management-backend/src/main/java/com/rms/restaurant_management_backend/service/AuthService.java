package com.rms.restaurant_management_backend.service;

import com.rms.restaurant_management_backend.dto.request.LoginRequest;
import com.rms.restaurant_management_backend.dto.request.RegisterRequest;
import com.rms.restaurant_management_backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
