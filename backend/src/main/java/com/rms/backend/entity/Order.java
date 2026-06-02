package com.rms.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Entity @Table(name="orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) 
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="customer_id") 
    private User customer;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="staff_id") 
    private User staff;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="table_id") 
    private RestaurantTable table;
    @Enumerated(EnumType.STRING) @Builder.Default 
    private OrderStatus status = OrderStatus.PENDING;
    @Column(precision=10,scale=2) @Builder.Default 
    private BigDecimal totalAmount = BigDecimal.ZERO;
    @Column(precision=10,scale=2) @Builder.Default 
    private BigDecimal taxAmount = BigDecimal.ZERO;
    @Column(columnDefinition="TEXT") 
    private String notes;
    @Builder.Default 
    private Boolean isParcel = false;
    @OneToMany(mappedBy="order",cascade=CascadeType.ALL,orphanRemoval=true)
    @Builder.Default 
    private List<OrderItem> orderItems = new ArrayList<>();
    @OneToOne(mappedBy="order",cascade=CascadeType.ALL) 
    private Payment payment;
    @Column(updatable=false) 
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate(){ createdAt=LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate(){ updatedAt=LocalDateTime.now(); }
    public enum OrderStatus { PENDING,CONFIRMED,IN_PROGRESS,READY,SERVED,CLOSED,CANCELLED }
}
