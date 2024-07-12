package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.Badge;
import com.bezkoder.springjwt.models.Notification;
import com.bezkoder.springjwt.models.QuestionsRH;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.repository.QuestionsRHRepository;
import com.bezkoder.springjwt.security.services.NotificationService;
import com.bezkoder.springjwt.security.services.UserService;
import com.bezkoder.springjwt.util.FileUploadUtil;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/QuestionsRH")
public class QuestionsRHController {
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private QuestionsRHRepository questionsRHRepository;
    @Autowired
    private UserService userService; // Assuming you have a UserService
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    // Get all QuestionsRH
    @GetMapping("/")
    public List<QuestionsRH> getAllQuestionsRH() {
        return questionsRHRepository.findAll();
    }

    // Get a single QuestionsRH by ID
    @GetMapping("/{id}")
    public List<QuestionsRH> getQuestionsByUserId(@PathVariable Long id) {
        return questionsRHRepository.findByUserId(id);
    }
    @GetMapping("/pdfs/{fileName:.+}")
    @ResponseBody
    public ResponseEntity<Resource> getPdf(@PathVariable String fileName) throws IOException {
        // Adjust the base path according to your file storage configuration
        String basePath = "QuestionRh";
        String filePath = Paths.get(basePath, fileName).toString();
        System.out.println("filePath"+filePath);
        Path pdfPath = Paths.get(filePath);
        System.out.println("pdfPath"+pdfPath);
        if (!Files.exists(pdfPath)) {

            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(pdfPath.toUri());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentLength(resource.contentLength());
        headers.setContentDispositionFormData("attachment", fileName);

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }
    // Create a new QuestionsRH
    @PostMapping("/add")
    public ResponseEntity<QuestionsRH> createQuestionsRH(
            @RequestParam String categories,
            @RequestParam String sousCategories,
            @RequestParam String titre,
            @RequestParam String descriptions,
            @RequestParam(value = "piecesJoint", required = false) MultipartFile multipartFile,
            @RequestParam Long userId
    ) throws IOException {
        QuestionsRH questionsRH = new QuestionsRH();
        String fileName = null;
        if (multipartFile != null) {
            fileName = StringUtils.cleanPath(FilenameUtils.getBaseName(multipartFile.getOriginalFilename())
                    + "_" + System.currentTimeMillis()
                    + "." + FilenameUtils.getExtension(multipartFile.getOriginalFilename()));

            Path uploadDir = Paths.get("QuestionRh/");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            Files.copy(multipartFile.getInputStream(), uploadDir.resolve(fileName));

            questionsRH.setPiecesJoint(fileName);
            System.out.println(fileName);
        }
        questionsRH.setCategories(categories);
        questionsRH.setTitre(titre);
        questionsRH.setDescriptions(descriptions);
        questionsRH.setUserId(userId);
        questionsRH.setSousCategories(sousCategories);

        QuestionsRH createdQuestionRh = questionsRHRepository.save(questionsRH);

        User user = userService.getUserById(userId);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // User not found
        }

        String username = user.getUsername();
        String message = "A Questions Rh request has been made by user: " + username + ".";
        String oldfileName = user.getPhotos();
        Notification notification = notificationService.createNotificationManager(userId, oldfileName, message, username);
        Map<String, Object> data = new HashMap<>();
        data.put("id", notification.getId()); // Add ID to the data
        data.put("userId", userId);
        data.put("fileName", oldfileName);
        data.put("message", message);
        data.put("username", username);
        data.put("timestamp", notification.getTimestamp()); // Add timestamp to the data
        // Send notification through WebSocket
        messagingTemplate.convertAndSend("/manager/notification", data);
        return new ResponseEntity<>(createdQuestionRh, HttpStatus.CREATED);
    }

    // Update a QuestionsRH by ID
    @PutMapping("/{id}")
    public QuestionsRH updateQuestionsRH(@PathVariable Long id, @RequestBody QuestionsRH questionsRH) {
        if (questionsRHRepository.existsById(id)) {
            questionsRH.setId(id);
            return questionsRHRepository.save(questionsRH);
        } else {
            return null; // Handle not found case
        }
    }

    // Delete a QuestionsRH by ID
    @DeleteMapping("/{id}")
    public void deleteQuestionsRH(@PathVariable Long id) {
        questionsRHRepository.deleteById(id);
    }
}
