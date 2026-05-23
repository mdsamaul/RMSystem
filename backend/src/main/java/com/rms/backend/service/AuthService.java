package com.rms.backend.service;

import com.rms.backend.dto.request.LoginRequest;
import com.rms.backend.dto.request.RegisterRequest;
import com.rms.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
