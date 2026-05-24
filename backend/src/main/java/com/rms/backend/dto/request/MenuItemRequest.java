package com.rms.backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuItemRequest {
    @NotNull private Long categoryId;
    @NotBlank @Size(max=150) private String name;
    private String description;
    @NotNull @DecimalMin("0.01") private BigDecimal price;
    private String imageUrl;
    @Builder.Default private Boolean isAvailable = true;
    @Builder.Default private Integer estimatedMinutes = 15;
}
