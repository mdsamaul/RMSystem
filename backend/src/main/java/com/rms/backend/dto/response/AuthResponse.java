package com.rms.backend.dto.response;
import lombok.*;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private Long id;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private String fullName;
    private String email;
    private String role;
    private Set<String> permissions;
    public static AuthResponse of(Long id, String accessToken, String refreshToken, String fullName, String email, String role, Set<String> permissions) {
        return AuthResponse.builder()
                .id(id)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .fullName(fullName)
                .email(email)
                .role(role)
                .permissions(permissions)
                .build();
    }
}
