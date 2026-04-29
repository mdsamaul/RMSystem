package com.rms.restaurant_management_backend.dto.response;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private String fullName;
    private String email;
    private String role;
    public static AuthResponse of(String accessToken, String refreshToken, String fullName, String email, String role) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .fullName(fullName)
                .email(email)
                .role(role)
                .build();
    }
}