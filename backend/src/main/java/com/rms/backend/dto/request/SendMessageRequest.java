package com.rms.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SendMessageRequest {
    @NotBlank private String message;
}
