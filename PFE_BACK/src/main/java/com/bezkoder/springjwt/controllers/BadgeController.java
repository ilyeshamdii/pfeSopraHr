package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.Badge;
import com.bezkoder.springjwt.models.Notification;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.repository.BadgeRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import com.bezkoder.springjwt.security.services.BadgeService;
import com.bezkoder.springjwt.security.services.NotificationService;
import com.bezkoder.springjwt.security.services.UserService;
import com.bezkoder.springjwt.util.BadgeNotFoundException;
import com.bezkoder.springjwt.util.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.logging.Logger;

@CrossOrigin(origins = "*", maxAge = 3600)

@RestController
@RequestMapping("/api/badges")
public class BadgeController {
    @Autowired
    private BadgeRepository badgeRepository;
    @Autowired
    private UserService userService; // Assuming you have a UserService
    @Autowired
    private BadgeService badgeService;
    @Autowired
    UserRepository userRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private NotificationService notificationService;
    private static final Logger logger = Logger.getLogger(NotificationService.class.getName());

    @GetMapping("/images/{badgeid}/{fileName}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long badgeid, @PathVariable String fileName , @AuthenticationPrincipal UserDetails userDetails) throws IOException {
//        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
//            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
//        }
        Optional<Badge> badgeOptional = badgeRepository.findById(badgeid);
        if (badgeOptional.isEmpty()) {
            String errorMessage = "User not found with ID: " + badgeid;
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage.getBytes());
        }
        // Construct the path to the image file
        String filePath = "badge-photos/" + badgeid + "/" + fileName;
        Path path = Paths.get(filePath);

        if (!Files.exists(path)) {
            String errorMessage = "Image not found for user ID: " + badgeid + " and file name: " + fileName;
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage.getBytes());
        }

        // Read the image file as bytes
        byte[] imageData = Files.readAllBytes(path);

        // Set content type header
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG); // Adjust content type as needed

        // Serve the image data as a response
        return ResponseEntity.ok().headers(headers).body(imageData);
    }


    @PostMapping("/{userId}")
    public ResponseEntity<Badge> createBadgeForUser(@PathVariable Long userId, @RequestParam String Newusername, @RequestParam String Newmatricule, @RequestParam(value = "image", required = false) MultipartFile multipartFile, @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }

        // Retrieve the user from the database using the UserService
        User user = userService.getUserById(userId);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // User not found
        }

        Badge badge = new Badge();


        String fileName = null;
        if (multipartFile != null) {
            fileName = StringUtils.cleanPath(Objects.requireNonNull(multipartFile.getOriginalFilename()));
            badge.setPhotos(fileName);
            System.out.println(fileName);
        }

        badge.setUsername(Newusername);
        badge.setMatricule(Newmatricule);
        badge.setUser(user);
        badge.setStatus("en cours");

        // Save the badge to the database
        Badge createdBadge = badgeRepository.save(badge);
        if (multipartFile != null) {
            String uploadDir = "badge-photos/" + createdBadge.getId();
            FileUploadUtil.saveFile(uploadDir, fileName, multipartFile);
        }
        String username = user.getUsername();
        String message = "User " + username + " has requested a badge.";
        String oldfileName = user.getPhotos();
        Notification notification = notificationService.createNotification(userId, oldfileName, message, username);

        Map<String, Object> data = new HashMap<>();
        data.put("id", notification.getId()); // Add ID to the data
        data.put("userId", userId);
        data.put("fileName", oldfileName);
        data.put("message", message);
        data.put("username", username);
        data.put("timestamp", notification.getTimestamp()); // Add timestamp to the data

        // Send notification through WebSocket
        messagingTemplate.convertAndSend("/topic/notification", data);
        return new ResponseEntity<>(createdBadge, HttpStatus.CREATED);
    }
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteBadgeRequest(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }

        try {
            // Call the service method to update badges as deleted
            badgeService.setBadgesAsDeletedByUserId(userId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // Success response
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete badge requests: " + e.getMessage());
        }
    }


    @GetMapping("/status/{userId}")
    public ResponseEntity<?> checkBadgeStatus(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have the required role
        }
        try {
            // Check if the user has a badge with status "accepter"
            String status = badgeService.findBadgeStatusByUserId(userId);

            // Get deleted status
            boolean isDeleted = badgeService.isBadgeDeleted(userId);

            // Prepare the response with status and isDeleted information
            Map<String, Object> response = new HashMap<>();
            response.put("status", status);
            response.put("isDeleted", isDeleted);

            return ResponseEntity.ok().body(response);
        } catch (BadgeNotFoundException e) {
           // logger.error("Badge not found for userId: {}", userId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Badge not found for userId: " + userId);
        } catch (Exception e) {
           // logger.error("Error checking badge status for userId: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error checking badge status");
        }
    }


    @GetMapping("/")
    public ResponseEntity<?> getAllBadges(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_GESTIONNAIRE"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        try {
            List<Badge> badges = badgeRepository.findAll();
            return ResponseEntity.ok().body(badges);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving badges: " + e.getMessage());
        }
    }
    @PutMapping("/accept/{badgeId}")
    public ResponseEntity<?> acceptBadge(@PathVariable Long badgeId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GESTIONNAIRE"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }


        Badge acceptedBadge = badgeService.acceptBadge(badgeId);
        String message = "Your badge request has been accepted.";
        Notification notification = notificationService.createNotificationBadge(acceptedBadge.getUser().getId(),  acceptedBadge.getUser().getPhotos(), message, acceptedBadge.getUser().getUsername());

        sendBadgeNotification(acceptedBadge.getUser().getId(), acceptedBadge.getUser().getPhotos(), message, acceptedBadge.getUser().getUsername(), notification);

        return new ResponseEntity<>(HttpStatus.OK);
    }
    private void sendBadgeNotification(Long userId, String fileName, String message, String username, Notification notification) {
        // Construct data object for WebSocket message
        Map<String, Object> data = new HashMap<>();
        data.put("userId", userId);
        data.put("fileName", fileName);
        data.put("message", message);
        data.put("username", username);
        data.put("timestamp", notification.getTimestamp()); // Add timestamp to the data
        data.put("id", notification.getId()); // Add ID to the data

        // Add other necessary data fields
        logger.info("Sending notification to user: " + userId);
        logger.info("Notification data: " + data);


        // Send notification through WebSocket
        messagingTemplate.convertAndSendToUser(String.valueOf(userId), "/queue/notification", data);
        logger.info("Notification sent to user: " + userId);


    }
    @PutMapping("/refuse/{badgeId}")
    public ResponseEntity<?> refuseBadge(@PathVariable Long badgeId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GESTIONNAIRE"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        Badge refusedBadge = badgeService.refuseBadge(badgeId);
        String message = "Your badge request has been refused.";

        Notification notification = notificationService.createNotificationBadge(refusedBadge.getUser().getId(), refusedBadge.getUser().getPhotos(), message, refusedBadge.getUser().getUsername());

        sendBadgeNotification(refusedBadge.getUser().getId(), refusedBadge.getUser().getPhotos(), message, refusedBadge.getUser().getUsername(), notification);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBadgesByUserId(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        try {
            // Retrieve the user by ID
            User user = userService.getUserById(userId);
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND); // User not found
            }

            // Retrieve badges by user
            List<Badge> badges = badgeRepository.findByUserAndIsDeleted(user, false);
            return ResponseEntity.ok().body(badges);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving badges for user with ID: " + e);
        }
    }

    @GetMapping("/TotaleBadge/{userId}")
    public ResponseEntity<?> getBadgesByUserIdTotale(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        try {
            // Retrieve the user by ID
            User user = userService.getUserById(userId);
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND); // User not found
            }

            // Retrieve badges by user
            List<Badge> badges = badgeRepository.findByUser(user);
            return ResponseEntity.ok().body(badges);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving badges for user with ID: " + e);
        }
    }

    @PutMapping("/{badgeId}")
    public ResponseEntity<Badge> updateBadge(@PathVariable Long badgeId, @RequestParam String username, @RequestParam String matricule,
                                             @RequestParam(value = "image", required = false) MultipartFile image,
                                             @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        // Check if the current user is allowed to update badges
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }

        // Retrieve the badge from the database
        Optional<Badge> badgeOptional = badgeRepository.findById(badgeId);
        if (badgeOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Badge not found
        }
        Badge badge = badgeOptional.get();

        // Update badge information
        badge.setUsername(username);
        badge.setMatricule(matricule);

        // Update badge image if provided
        if (image != null && !image.isEmpty()) {
            String fileName = StringUtils.cleanPath(Objects.requireNonNull(image.getOriginalFilename()));
            badge.setPhotos(fileName);
            String uploadDir = "badge-photos/" + badgeId;
            FileUploadUtil.saveFile(uploadDir, fileName, image);
        }

        // Save the updated badge
        Badge updatedBadge = badgeRepository.save(badge);
        return ResponseEntity.ok(updatedBadge);
    }
    @GetMapping("/GetAllnotifications")
    public ResponseEntity<List<Notification>> getNotificationsForUser() {
        List<Notification> notifications = notificationService.getAllNotificationsForAdminUsers();
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    @GetMapping("/GetAllnotificationsManager")
    public ResponseEntity<List<Notification>> getNotificationsForManger() {
        List<Notification> notifications = notificationService.getAllNotificationsForManager();
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }


    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<?> deleteNotificationById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Set<String> allowedRoles = new HashSet<>(Arrays.asList("ROLE_GESTIONNAIRE", "ROLE_COLLABORATEUR" ,"ROLE_MANAGER"));

        if (!userDetails.getAuthorities().stream().anyMatch(a -> allowedRoles.contains(a.getAuthority()))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
    

        notificationService.deleteNotificationById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @GetMapping("/notifications/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsForUser(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

}

