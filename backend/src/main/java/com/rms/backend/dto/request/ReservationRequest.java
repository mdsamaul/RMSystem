package com.rms.backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReservationRequest {
    @NotNull private Long tableId;
    @NotNull @Min(1) @Max(50) private Integer partySize;
    @NotNull private LocalDateTime reservedAt;
    private String notes;
}
