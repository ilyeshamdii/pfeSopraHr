package com.bezkoder.springjwt.security.services;


import com.bezkoder.springjwt.models.Notification;
import com.bezkoder.springjwt.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service


public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;


    public Notification createNotificationManager(Long userId, String fileName, String message, String username) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setFileName(fileName);
        notification.setMessage(message);
        notification.setUsername(username);
        notification.setTimestamp(LocalDateTime.now());
        notification.setAdmin(false);
        notification.setManager(true);
        return notificationRepository.save(notification);
    }




    public Notification createNotification(Long userId, String fileName, String message, String username) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setFileName(fileName);
        notification.setMessage(message);
        notification.setUsername(username);
        notification.setTimestamp(LocalDateTime.now());
        notification.setAdmin(true);
        notification.setManager(false);

        return notificationRepository.save(notification);
    }
    public Notification createNotificationBadge(Long userId, String fileName, String message, String username) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setFileName(fileName);
        notification.setMessage(message);
        notification.setUsername(username);
        notification.setTimestamp(LocalDateTime.now());
        notification.setAdmin(false);
        notification.setManager(false);

        return notificationRepository.save(notification);
    }


    public List<Notification> getAllNotificationsForAdminUsers() {
        List<Notification> allNotifications = notificationRepository.findAll();
        return allNotifications.stream()
                .filter(Notification::isAdmin)
                .collect(Collectors.toList());
    }
    public List<Notification> getAllNotificationsForManager() {
        List<Notification> allNotifications = notificationRepository.findAll();
        return allNotifications.stream()
                .filter(Notification::isManager)
                .collect(Collectors.toList());
    }
    public void deleteNotificationById(Long id) {
        notificationRepository.deleteById(id);
    }
    public List<Notification> getNotificationsByUserId(Long userId) {
        // Retrieve all notifications for the specified user
        List<Notification> notifications = notificationRepository.findByUserId(userId);

        // Filter out notifications where isAdmin is false and isManager is false
        return notifications.stream()
                .filter(notification -> !notification.isAdmin() && !notification.isManager())
                .collect(Collectors.toList());
    }


}