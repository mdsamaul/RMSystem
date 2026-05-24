package com.rms.backend.dto.response;
import com.rms.backend.entity.MenuItem;
import lombok.*;
import java.math.BigDecimal; import java.time.LocalDateTime;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuItemResponse {
    private Long id; private Long categoryId; private String categoryName;
    private String name; private String description; private BigDecimal price;
    private String imageUrl; private Boolean isAvailable; private Integer estimatedMinutes; private LocalDateTime createdAt;
    public static MenuItemResponse from(MenuItem m){
        return MenuItemResponse.builder().id(m.getId()).categoryId(m.getCategory().getId())
            .categoryName(m.getCategory().getName()).name(m.getName()).description(m.getDescription())
            .price(m.getPrice()).imageUrl(m.getImageUrl()).isAvailable(m.getIsAvailable())
            .estimatedMinutes(m.getEstimatedMinutes() != null ? m.getEstimatedMinutes() : 15)
            .createdAt(m.getCreatedAt()).build(); }
}
