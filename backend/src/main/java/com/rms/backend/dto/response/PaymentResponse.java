package com.rms.backend.dto.response;


import lombok.*;
import java.math.BigDecimal; import java.time.LocalDateTime;

import com.rms.backend.entity.Payment;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentResponse {
    private Long id; private Long orderId; private BigDecimal amount;
    private String paymentMethod; private String status;
    private String transactionRef; private LocalDateTime paidAt; private LocalDateTime createdAt;
    public static PaymentResponse from(Payment p){
        return PaymentResponse.builder().id(p.getId()).orderId(p.getOrder().getId())
            .amount(p.getAmount()).paymentMethod(p.getPaymentMethod().name())
            .status(p.getStatus().name()).transactionRef(p.getTransactionRef())
            .paidAt(p.getPaidAt()).createdAt(p.getCreatedAt()).build(); }
}
