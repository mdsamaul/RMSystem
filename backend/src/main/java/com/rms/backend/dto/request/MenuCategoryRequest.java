package com.rms.backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuCategoryRequest {
    @NotBlank @Size(max=100) private String name;
    private String description;
    @Builder.Default private Integer sortOrder = 0;
}
