package com.rms.backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateOrderRequest {
    private Long tableId;
    private String notes;
    @Builder.Default private Boolean isParcel = false;
    @NotEmpty private List<OrderItemRequest> items;
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderItemRequest {
        @NotNull private Long menuItemId;
        @NotNull @Min(1) private Integer quantity;
        private String specialRequest;
    }
}
