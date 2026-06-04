package com.rms.backend.dto.request;

import com.rms.backend.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StaffUpdateRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank @Email
    private String email;

    private String phone;

    @Size(min = 6)
    private String password;

    private Boolean isActive;

    @Builder.Default
    private Set<User.Permission> permissions = new HashSet<>();
}
