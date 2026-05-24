package com.rms.backend.dto.response;
import com.rms.backend.entity.MenuCategory;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuCategoryResponse {
    private Long id; private String name; private String description;
    private Boolean isActive; private Integer sortOrder;
    public static MenuCategoryResponse from(MenuCategory c){
        return MenuCategoryResponse.builder().id(c.getId()).name(c.getName())
            .description(c.getDescription()).isActive(c.getIsActive()).sortOrder(c.getSortOrder()).build(); }
}
