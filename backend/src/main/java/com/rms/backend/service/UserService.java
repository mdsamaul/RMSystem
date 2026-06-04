package com.rms.backend.service;

import java.util.List;
import java.util.Set;

import com.rms.backend.dto.request.StaffUpdateRequest;
import com.rms.backend.dto.response.UserResponse;
import com.rms.backend.entity.User;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse getProfile(String email);
    void toggleUserStatus(Long id);
    UserResponse updateStaffPermissions(Long id, Set<User.Permission> permissions);
    UserResponse updateStaff(Long id, StaffUpdateRequest request);
}
