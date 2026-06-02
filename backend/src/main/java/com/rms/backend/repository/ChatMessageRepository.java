package com.rms.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rms.backend.entity.ChatMessage;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByOrderIdOrderByCreatedAtAsc(Long orderId);
    long countByOrderIdAndIsReadFalseAndSender_RoleNot(Long orderId, com.rms.backend.entity.User.Role role);
}
