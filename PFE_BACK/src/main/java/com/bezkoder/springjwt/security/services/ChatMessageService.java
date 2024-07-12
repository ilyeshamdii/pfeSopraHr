package com.bezkoder.springjwt.security.services;

import com.bezkoder.springjwt.models.ChatMessage;
import com.bezkoder.springjwt.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatMessageService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getMessagesByRecipient(String recipient) {
        return chatMessageRepository.findByRecipient(recipient);
    }
    public List<ChatMessage> findMessagesByUserId(Long userId) {
        return chatMessageRepository.findBySenderOrRecipient(String.valueOf(userId), String.valueOf(userId));
    }
    public List<ChatMessage> findMessagesByUserIdGest(Long userId) {
        return chatMessageRepository.findByUserId(userId);
    }

}