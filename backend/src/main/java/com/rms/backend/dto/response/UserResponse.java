package com.rms.backend.dto.response;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import com.rms.backend.entity.User;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private Set<String> permissions;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static UserResponse from(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .permissions(permissionsOf(u))
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build();
    }

    private static Set<String> permissionsOf(User u) {
        if (u.getRole() == User.Role.ADMIN) {
            return Arrays.stream(User.Permission.values()).map(Enum::name).collect(Collectors.toSet());
        }
        return u.getPermissions() == null
                ? Set.of()
                : u.getPermissions().stream().map(Enum::name).collect(Collectors.toSet());
    }
}
