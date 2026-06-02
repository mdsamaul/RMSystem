package com.rms.backend.service.impl;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rms.backend.dto.response.PaymentResponse;
import com.rms.backend.repository.PaymentRepository;
import com.rms.backend.service.PaymentService;

import java.time.LocalDateTime;

@Service @RequiredArgsConstructor @Transactional
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepo;
    private final OrderRepository orderRepo;

    @Override public PaymentResponse processPayment(PaymentRequest req) {
        if (paymentRepo.existsByOrderId(req.getOrderId()))
            throw new BadRequestException("Payment already processed for order: " + req.getOrderId());
        Order order = orderRepo.findById(req.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + req.getOrderId()));
        if (order.getStatus() == Order.OrderStatus.CANCELLED)
            throw new BadRequestException("Cannot pay for a cancelled order");
        Payment payment = Payment.builder().order(order).amount(order.getTotalAmount())
            .paymentMethod(req.getPaymentMethod()).status(Payment.PaymentStatus.COMPLETED)
            .transactionRef(req.getTransactionRef() != null ? req.getTransactionRef()
                : "TXN-" + System.currentTimeMillis())
            .paidAt(LocalDateTime.now()).build();
        order.setStatus(Order.OrderStatus.CLOSED);
        orderRepo.save(order);
        return PaymentResponse.from(paymentRepo.save(payment));
    }

    @Override @Transactional(readOnly=true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        return PaymentResponse.from(paymentRepo.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId)));
    }
}
