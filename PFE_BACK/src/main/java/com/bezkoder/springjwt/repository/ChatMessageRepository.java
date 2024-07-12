package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRecipient(String recipient);
    List<ChatMessage> findBySenderOrRecipient(String sender, String recipient);
    List<ChatMessage> findByUserId(Long userId);

}