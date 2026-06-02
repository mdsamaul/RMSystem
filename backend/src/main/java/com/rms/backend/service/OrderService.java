package com.rms.backend.service;


import java.util.List;

import com.rms.backend.dto.request.CreateOrderRequest;
import com.rms.backend.dto.response.OrderResponse;
import com.rms.backend.entity.Order;
public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest req, String customerEmail);
    OrderResponse getOrderById(Long id);
    List<OrderResponse> getAllOrders();
    List<OrderResponse> getMyOrders(String customerEmail);
    List<OrderResponse> getOrdersByStatus(Order.OrderStatus status);
    OrderResponse updateStatus(Long id, Order.OrderStatus newStatus);
    void cancelOrder(Long id, String userEmail);
}
