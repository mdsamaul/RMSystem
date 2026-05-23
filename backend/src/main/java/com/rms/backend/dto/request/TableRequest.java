package com.rms.backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TableRequest {
    @NotBlank private String tableNumber;
    @NotNull @Min(1) @Max(50) private Integer capacity;
    private String section;
}
