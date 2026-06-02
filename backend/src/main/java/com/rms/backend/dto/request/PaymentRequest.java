package com.rms.backend.dto.request;

import com.rms.backend.entity.Payment;

import jakarta.validation.constraints.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentRequest {
    @NotNull private Long orderId;
    @NotNull private Payment.PaymentMethod paymentMethod;
    private String transactionRef;
}
