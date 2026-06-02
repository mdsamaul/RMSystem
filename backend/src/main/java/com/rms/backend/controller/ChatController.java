package com.rms.backend.controller;


import com.rms.backend.dto.request.SendMessageRequest;
import com.rms.backend.dto.response.ApiResponse;
import com.rms.backend.dto.response.ChatMessageResponse;
import com.rms.backend.entity.ChatMessage;
import com.rms.backend.entity.Order;
import com.rms.backend.entity.User;
import com.rms.backend.exception.ResourceNotFoundException;
import com.rms.backend.repository.ChatMessageRepository;
import com.rms.backend.repository.OrderRepository;
import com.rms.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@SecurityRequirement(name="bearerAuth")
@Tag(name="Chat", description="Customer-Staff chat per order")
public class ChatController {
    private final ChatMessageRepository chatRepo;
    private final OrderRepository orderRepo;
    private final UserRepository userRepo;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        List<ChatMessageResponse> messages = chatRepo.findByOrderIdOrderByCreatedAtAsc(orderId)
            .stream().map(ChatMessageResponse::from).collect(Collectors.toList());
        // Mark messages from other side as read
        User me = userRepo.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        chatRepo.findByOrderIdOrderByCreatedAtAsc(orderId).forEach(msg -> {
            if (!msg.getSender().getId().equals(me.getId()) && !msg.getIsRead()) {
                msg.setIsRead(true); chatRepo.save(msg);
            }
        });
        return ResponseEntity.ok(ApiResponse.success("Messages fetched", messages));
    }

    @PostMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable Long orderId,
            @Valid @RequestBody SendMessageRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        User sender = userRepo.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ChatMessage msg = ChatMessage.builder()
            .order(order).sender(sender).message(req.getMessage()).build();
        ChatMessageResponse response = ChatMessageResponse.from(chatRepo.save(msg));
        // Broadcast via WebSocket
        messagingTemplate.convertAndSend("/topic/chat/" + orderId, response);
        return ResponseEntity.ok(ApiResponse.success("Message sent", response));
    }

    @GetMapping("/unread/order/{orderId}")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = userRepo.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        long count = chatRepo.countByOrderIdAndIsReadFalseAndSender_RoleNot(orderId, me.getRole());
        return ResponseEntity.ok(ApiResponse.success("Unread count", count));
    }
}

