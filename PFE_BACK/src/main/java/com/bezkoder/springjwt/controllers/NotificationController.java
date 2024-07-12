package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.Notifications;
import com.bezkoder.springjwt.security.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificationController {
    @Autowired
    private SimpMessagingTemplate template;
    // Initialize Notifications
    private Notifications notifications = new Notifications(0);
    @GetMapping("/notify")
    public String getNotification() {
        // Increment Notification by one
        notifications.increment();
        // Push notifications to front-end
        template.convertAndSend("/topic/notification", "aaaaaaaaaa");
        return "Notifications successfully sent to Angular !";
    }
}
