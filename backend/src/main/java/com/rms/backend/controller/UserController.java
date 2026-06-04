package com.rms.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rms.backend.dto.request.StaffPermissionsRequest;
import com.rms.backend.dto.request.StaffUpdateRequest;
import com.rms.backend.dto.response.ApiResponse;
import com.rms.backend.dto.response.UserResponse;
import com.rms.backend.service.UserService;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@SecurityRequirement(name="bearerAuth")
@Tag(name="Users", description = "User management")
public class UserController {
    private final UserService  userService;
    
    @GetMapping("/profile")
    @Operation(summary = "Get my profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Profile Fetched", userService.getProfile(user.getUsername())));

    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched", userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User fetched", userService.getUserById(id)));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Enable or disable a user")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status toggled"));
    }

    @PatchMapping("/{id}/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign staff permissions")
    public ResponseEntity<ApiResponse<UserResponse>> updatePermissions(
            @PathVariable Long id,
            @RequestBody StaffPermissionsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Permissions updated",
                userService.updateStaffPermissions(id, request.getPermissions())));
    }

    @PutMapping("/{id}/staff")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update staff user details")
    public ResponseEntity<ApiResponse<UserResponse>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Staff updated",
                userService.updateStaff(id, request)));
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create staff user")
    public ResponseEntity<ApiResponse<UserResponse>> createStaff(
            @Valid @RequestBody StaffUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Staff created",
                userService.createStaff(request)));
    }
}
