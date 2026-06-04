package com.rms.backend.dto.request;

import com.rms.backend.entity.User;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StaffPermissionsRequest {
    @Builder.Default
    private Set<User.Permission> permissions = new HashSet<>();
}
