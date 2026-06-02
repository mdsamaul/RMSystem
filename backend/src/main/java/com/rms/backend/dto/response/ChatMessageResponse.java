package com.rms.backend.dto.response;


import lombok.*;
import java.time.LocalDateTime;

import com.rms.backend.entity.ChatMessage;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessageResponse {
    private Long id;
    private Long orderId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static ChatMessageResponse from(ChatMessage m) {
        return ChatMessageResponse.builder()
            .id(m.getId())
            .orderId(m.getOrder().getId())
            .senderId(m.getSender().getId())
            .senderName(m.getSender().getFullName())
            .senderRole(m.getSender().getRole().name())
            .message(m.getMessage())
            .isRead(m.getIsRead())
            .createdAt(m.getCreatedAt())
            .build();
    }
}
