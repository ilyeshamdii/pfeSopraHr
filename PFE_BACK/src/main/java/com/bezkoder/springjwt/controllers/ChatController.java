package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.ChatMessage;
import com.bezkoder.springjwt.models.MessageDetails;
import com.bezkoder.springjwt.repository.MessageDetailsRepository;
import com.bezkoder.springjwt.security.services.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class ChatController {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    @Autowired
    private ChatMessageService chatMessageService;
    @Autowired
    private MessageDetailsRepository messageDetailsRepository;

    private static final String GESTIONNAIRE = "1"; // assuming gestionnaire's id is "1"



    @PostMapping("/update-all-is-clicked-to-false")
    public ResponseEntity<String> updateAllIsClickedToFalse() {
        try {
            messageDetailsRepository.updateAllIsClickedToFalse();
            return ResponseEntity.ok("All MessageDetails updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update all MessageDetails: " + e.getMessage());
        }
    }


    @MessageMapping("/chat")
    public void handleChatMessage(ChatMessage message) {
        // Send the message to the gestionnaire
        chatMessageService.saveMessage(message);
        MessageDetails messageDetails = new MessageDetails();
        messageDetails.setLength(messageDetails.getLength() + 1);
        messageDetails.setUserId(message.getUserId());
        messageDetails.setClicked(false); // Set isClicked to false by default

        // Save message details to the database
        messageDetailsRepository.save(messageDetails);
        message.setRecipient(GESTIONNAIRE);
        message.setUserId(Long.valueOf(message.getSender()));
        simpMessagingTemplate.convertAndSendToUser(GESTIONNAIRE, "/queue2/notification", message);
    }


    @MessageMapping("/reply")
    public void handleReplyMessage(ChatMessage message) {
        // Send the reply from gestionnaire to the original sender
        chatMessageService.saveMessage(message);

        simpMessagingTemplate.convertAndSendToUser(message.getRecipient(), "/queue2/notification", message);
    }
//    @GetMapping("/api/messages/{recipient}")
//    public List<ChatMessage> getMessagesByRecipient(@PathVariable String recipient) {
//        return chatMessageService.getMessagesByRecipient(recipient);
//    }
    @GetMapping("/api/messages/{userId}")
    public List<ChatMessage> getMessagesByUserId(@PathVariable Long userId) {
        return chatMessageService.findMessagesByUserId(userId);
    }

    @GetMapping("/gest/{userId}")
    public List<ChatMessage> getMessagesByUserIdgestionnaire(@PathVariable Long userId) {
        return chatMessageService.findMessagesByUserId(userId);
    }
    @GetMapping("/count-unread")
    public Long countUnreadMessages() {
        return messageDetailsRepository.countByIsClickedFalse();
    }
}
