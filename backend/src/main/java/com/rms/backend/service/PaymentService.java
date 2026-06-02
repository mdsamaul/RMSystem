package com.rms.backend.service;

import com.rms.backend.dto.request.PaymentRequest;
import com.rms.backend.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest req);
    PaymentResponse getPaymentByOrderId(Long orderId);
}
