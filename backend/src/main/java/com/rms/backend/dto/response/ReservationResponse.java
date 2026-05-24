package com.rms.backend.dto.response;

import com.rms.backend.entity.Reservation;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReservationResponse {
    private Long id; private Long customerId; private String customerName;
    private Long tableId; private String tableNumber; private Integer partySize;
    private LocalDateTime reservedAt; private String status; private String notes;
    private LocalDateTime createdAt;
    public static ReservationResponse from(Reservation r){
        return ReservationResponse.builder().id(r.getId())
            .customerId(r.getCustomer().getId()).customerName(r.getCustomer().getFullName())
            .tableId(r.getTable().getId()).tableNumber(r.getTable().getTableNumber())
            .partySize(r.getPartySize()).reservedAt(r.getReservedAt())
            .status(r.getStatus().name()).notes(r.getNotes()).createdAt(r.getCreatedAt()).build(); }
}
