package com.rms.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="reservations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reservation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="customer_id",nullable=false) private User customer;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="table_id",nullable=false) private RestaurantTable table;
    @Column(nullable=false) private Integer partySize;
    @Column(nullable=false) private LocalDateTime reservedAt;
    @Enumerated(EnumType.STRING) @Builder.Default private ReservationStatus status = ReservationStatus.PENDING;
    @Column(columnDefinition="TEXT") private String notes;
    @Column(updatable=false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate(){ createdAt=LocalDateTime.now(); }
    public enum ReservationStatus { PENDING,CONFIRMED,SEATED,COMPLETED,CANCELLED }
}
