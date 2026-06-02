package com.rms.backend.controller;

import com.rms.backend.dto.request.CreateOrderRequest;
import com.rms.backend.dto.response.ApiResponse;
import com.rms.backend.dto.response.OrderResponse;
import com.rms.backend.entity.Order;
import com.rms.backend.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@SecurityRequirement(name="bearerAuth")
@Tag(name="Orders", description="Order management")
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @Operation(summary="Create a new order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Order created", orderService.createOrder(req, user.getUsername())));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary="Get all orders (Admin/Staff only)")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @RequestParam(required=false) Order.OrderStatus status) {
        List<OrderResponse> orders = (status != null)
            ? orderService.getOrdersByStatus(status) : orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success("Orders fetched", orders));
    }

    @GetMapping("/my")
    @Operation(summary="Get my orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("My orders", orderService.getMyOrders(user.getUsername())));
    }

    @GetMapping("/{id}")
    @Operation(summary="Get order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order fetched", orderService.getOrderById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary="Update order status (Admin/Staff only)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id, @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", orderService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary="Cancel an order")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        orderService.cancelOrder(id, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled"));
    }
}
