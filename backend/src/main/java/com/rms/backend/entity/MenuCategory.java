package com.rms.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
@Entity @Table(name="menu_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuCategory {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,unique=true,length=100) private String name;
    @Column(columnDefinition="TEXT") private String description;
    @Builder.Default private Boolean isActive = true;
    @Builder.Default private Integer sortOrder = 0;
    @OneToMany(mappedBy="category",cascade=CascadeType.ALL,fetch=FetchType.LAZY)
    @Builder.Default private List<MenuItem> menuItems = new ArrayList<>();
}
