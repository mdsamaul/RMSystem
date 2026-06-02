package com.rms.backend.dto.response;


import lombok.*;
import java.math.BigDecimal; import java.time.LocalDateTime; import java.util.List;
import java.util.stream.Collectors;

import com.rms.backend.entity.Order;
import com.rms.backend.entity.OrderItem;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderResponse {
    private Long id; private Long customerId; private String customerName;
    private Long tableId; private String tableNumber; private String status;
    private BigDecimal totalAmount; private BigDecimal taxAmount;
    private String notes; private Boolean isParcel; private Integer estimatedMinutes;
    private List<OrderItemResponse> orderItems;
    private LocalDateTime createdAt; private LocalDateTime updatedAt;
    public static OrderResponse from(Order o){
        int estMins = o.getOrderItems().stream()
            .mapToInt(oi -> {
                int mins = oi.getMenuItem().getEstimatedMinutes() != null ? oi.getMenuItem().getEstimatedMinutes() : 15;
                return mins;
            }).max().orElse(15);
        return OrderResponse.builder().id(o.getId())
            .customerId(o.getCustomer()!=null?o.getCustomer().getId():null)
            .customerName(o.getCustomer()!=null?o.getCustomer().getFullName():"Walk-in")
            .tableId(o.getTable()!=null?o.getTable().getId():null)
            .tableNumber(o.getTable()!=null?o.getTable().getTableNumber():null)
            .status(o.getStatus().name()).totalAmount(o.getTotalAmount()).taxAmount(o.getTaxAmount())
            .notes(o.getNotes())
            .isParcel(o.getIsParcel() != null && o.getIsParcel())
            .estimatedMinutes(estMins)
            .orderItems(o.getOrderItems().stream().map(OrderItemResponse::from).collect(Collectors.toList()))
            .createdAt(o.getCreatedAt()).updatedAt(o.getUpdatedAt()).build(); }
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderItemResponse {
        private Long id; private Long menuItemId; private String menuItemName;
        private Integer quantity; private BigDecimal unitPrice; private BigDecimal subtotal;
        private String specialRequest;
        public static OrderItemResponse from(OrderItem i){
            return OrderItemResponse.builder().id(i.getId()).menuItemId(i.getMenuItem().getId())
                .menuItemName(i.getMenuItem().getName()).quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice()).subtotal(i.getSubtotal())
                .specialRequest(i.getSpecialRequest()).build(); }
    }
}
