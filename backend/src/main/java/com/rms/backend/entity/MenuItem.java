package com.rms.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name="menu_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="category_id",nullable=false) private MenuCategory category;
    @Column(nullable=false,length=150) private String name;
    @Column(columnDefinition="TEXT") private String description;
    @Column(nullable=false,precision=10,scale=2) private BigDecimal price;
    @Column(length=500) private String imageUrl;
    @Builder.Default private Boolean isAvailable = true;
    @Builder.Default private Integer estimatedMinutes = 15;
    @Column(updatable=false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate(){ createdAt=LocalDateTime.now(); }
}
