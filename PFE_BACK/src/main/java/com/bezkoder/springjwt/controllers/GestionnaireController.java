package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.Dto.DonnerDTO;
import com.bezkoder.springjwt.models.*;
import com.bezkoder.springjwt.repository.*;
import com.bezkoder.springjwt.security.services.AttestationService;
import com.bezkoder.springjwt.security.services.DonnerService;
import com.bezkoder.springjwt.security.services.NotificationService;
import com.bezkoder.springjwt.security.services.UserService;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@CrossOrigin(origins = "*", maxAge = 3600)

@RestController
@RequestMapping("/api/Gestionnaire")
public class GestionnaireController {
    private static final String UPLOAD_DIR = "attestations";
    @Autowired
    private UserService userService;
    @Autowired
    UserRepository userRepository;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    com.bezkoder.springjwt.repository.soldeCongerRepository soldeCongerRepository;

    @Autowired
    CongerMaladieRepository congerMaladieRepository;
    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private DonnerRepository donnerRepository;
    @Autowired
    private DonnerService donnerService;
    @Autowired
    private AttestationService attestationService;
    @Autowired
    private AttestationRepository attestationRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GESTIONNAIRE")  ||
                a.getAuthority().equals("ROLE_MANAGER"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }

        // Retrieve ROLE_MANAGER and ROLE_COLLABORATEUR roles
        Role roleManager = roleRepository.findByName(ERole.ROLE_MANAGER)
                .orElseThrow(() -> new RuntimeException("Role ROLE_MANAGER not found"));
        Role roleCollaborateur = roleRepository.findByName(ERole.ROLE_COLLABORATEUR)
                .orElseThrow(() -> new RuntimeException("Role ROLE_COLLABORATEUR not found"));

        // Fetch users with specified roles
        List<User> users = userRepository.findByRoleIds(Arrays.asList(roleManager.getId(), roleCollaborateur.getId()));
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long userId, @RequestParam boolean newStatus) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setStatus(newStatus);
            userRepository.save(user); // Save the updated user
            SoldeConger newSoldeConger = new SoldeConger();
            newSoldeConger.setUser(user);
            newSoldeConger.setSolde(30);
            soldeCongerRepository.save(newSoldeConger);
            sendEmail(user.getEmail(), newStatus);

            return ResponseEntity.ok().body("{\"message\": \"User status updated successfully\"}");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private void sendEmail(String userEmail, boolean newStatus) {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        String statusMessage = newStatus ? "Your access has been granted." : "Your access has been denied.";
        String loginPath = newStatus ? "http://localhost:4200/login" : "";
        try {
            helper.setTo(userEmail);
            helper.setSubject("User Status Update");
            helper.setText("Dear User,\n\n" + statusMessage + "\n\n" + loginPath + "\n\nRegards,\nThe Admin Team");
            javaMailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    @Transactional // Ensure that the transaction is committed before sending the email
    @PutMapping("/conger-maladie/{congerId}/status")
    public ResponseEntity<?> updateCongerStatus(@PathVariable Long congerId, @RequestBody String newStatus) {
        Optional<Conger_Maladie> congerOptional = congerMaladieRepository.findById(congerId);
        if (congerOptional.isPresent()) {
            Conger_Maladie conger = congerOptional.get();
            String oldStatus = conger.getStatus();

            conger.setStatus(newStatus);
            congerMaladieRepository.save(conger); // Save the updated conger

            // Check if the new status is "REFUSED"
            if ("REFUSED".equalsIgnoreCase(newStatus)) {
                // Find the user's SoldeConger
                Long durationInDays = donnerRepository.getDurationInDaysByCongerMaladieId(congerId);
                if (durationInDays != null) {
                    Optional<SoldeConger> soldeCongerOptional = Optional.ofNullable(soldeCongerRepository.findByUserId(conger.getUser().getId()));

                    if (soldeCongerOptional.isPresent()) {
                        SoldeConger soldeConger = soldeCongerOptional.get();
                        soldeConger.setSolde(soldeConger.getSolde() + durationInDays);
                        soldeCongerRepository.save(soldeConger); // Save the updated SoldeConger
                    }
                }
            }

            sendCongerStatusEmailAsync(conger.getUser().getEmail(), oldStatus, newStatus, conger);
            String message = String.format("Your leave request for %s from %s to %s has been %s.",
                    conger.getTypeConger(),
                    conger.getDateDebut(),
                    conger.getDateFin(),
                    newStatus.toLowerCase());

            Notification notification = notificationService.createNotificationBadge(
                    conger.getUser().getId(),
                    conger.getUser().getPhotos(), // Assuming justificationPath is the path to the file
                    message,
                    conger.getUser().getUsername() // Assuming User has getUsername method
            );

            sendBadgeNotification(
                    conger.getUser().getId(),
                    conger.getUser().getPhotos(),
                    message,
                    conger.getUser().getUsername(),
                    notification
            );

            return ResponseEntity.ok().body("{\"message\": \"Conger status updated successfully\"}");
        } else {
            return ResponseEntity.notFound().build();
        }
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


        // Send notification through WebSocket
        messagingTemplate.convertAndSendToUser(String.valueOf(userId), "/queue/notification", data);
    }
    @Async
    protected void sendCongerStatusEmailAsync(String userEmail, String oldStatus, String newStatus, Conger_Maladie conger) {
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");
            String userName = conger.getUser().getUsername();

            String statusMessage = "Your Conger Maladie status has been updated from <span style=\"color: red;\">" + oldStatus + "</span> to <span style=\"color: green;\">" + newStatus + "</span>";

            statusMessage += "<br><br><strong>Conger Maladie Details:</strong><br>";
            statusMessage += "<ul>";
            statusMessage += "<li>ID: " + conger.getId() + "</li>";
            statusMessage += "<li>Type de congé: " + conger.getTypeConger() + "</li>";

            statusMessage += "<li>Message: " + conger.getMessage() + "</li>";
            statusMessage += "<li>Date Debut: " + conger.getDateDebut() + "</li>";
            statusMessage += "<li>Date Fin: " + conger.getDateFin() + "</li>";
            statusMessage += "</ul>";

            helper.setTo(userEmail);
            helper.setSubject("Conger Maladie Status Update");
            // Set HTML content with all details
            helper.setText("<html><body><p>Dear " + userName + ",,</p><p>" + statusMessage + "</p><p>Regards,<br/>The Admin Team</p></body></html>", true);
            Path filePath = Paths.get("uploads", conger.getJustificationPath()); // Assuming uploads folder is at the root of your project
            byte[] fileBytes = Files.readAllBytes(filePath);
            // Add attachment
            helper.addAttachment("Justification File.pdf", new ByteArrayResource(fileBytes), "application/pdf");

            javaMailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/conger-maladie")
    public ResponseEntity<List<Conger_Maladie>> getAllCongerMaladie() {
        List<Conger_Maladie> congerMaladies = congerMaladieRepository.findAll();
        return ResponseEntity.ok().body(congerMaladies);
    }

    @GetMapping("/donner/conger-maladie/{congerMaladieId}")
    public ResponseEntity<DonnerDTO> getDonnerByCongerMaladieId(@PathVariable Long congerMaladieId) {
        Optional<DonnerDTO> donner = donnerService.getDonnerByCongerMaladieId(congerMaladieId);
        if (donner.isPresent()) {
            return ResponseEntity.ok().body(donner.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/SaveAttestations")
    public ResponseEntity<?> handleFileUpload(@RequestParam(value = "file", required = false) MultipartFile file,
                                              @RequestParam("name") String name,
                                              @RequestParam("isExist") boolean isExist) {
        try {
            if (file != null) {
                String fileName = StringUtils.cleanPath(FilenameUtils.getBaseName(file.getOriginalFilename()) + "_" + System.currentTimeMillis() + "." + FilenameUtils.getExtension(file.getOriginalFilename()));
                Path uploadDir = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }
                Files.copy(file.getInputStream(), uploadDir.resolve(fileName));

                String pdfPath = UPLOAD_DIR + "/" + fileName;

                // Save attestation data into the database
                Attestation attestation = new Attestation(name, pdfPath, isExist);
                attestationService.saveAttestation(attestation);

                // Return a success response with a custom message
                return ResponseEntity.ok().body("Attestation saved successfully");
            } else {
                Attestation attestation = new Attestation(name, isExist);
                attestationService.saveAttestation(attestation);
                // If file is null, return a bad request response
                return ResponseEntity.ok().body("Attestation saved successfully");
            }
        } catch (Exception e) {
            // If an exception occurs, return a server error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }

    @PostMapping("/GeneratePdf")
    public ResponseEntity<String> generatePdf(@RequestBody Map<String, String> pdfContentMap) {
        try {


            String pdfContent = pdfContentMap.get("pdfContent");
            String pdfName = pdfContentMap.get("pdfName");


            // Extract and trim the content
            String content = pdfContent.trim();

            // Remove double quotes from the extracted content
            content = content.replace("\"", "");

            // Create a new PDF document
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            // Create a new content stream for writing to the PDF
            PDPageContentStream contentStream = new PDPageContentStream(document, page);

            // Set the font and font size for the title
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 24);

            // Calculate the width of the title
            String title = "Attestations " + pdfName;
            float titleWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(title) / 1000f * 24;
            float pageWidth = page.getMediaBox().getWidth();
            float titleX = (pageWidth - titleWidth) / 2f; // Center the title horizontally

            // Write the title to the PDF
            contentStream.beginText();
            contentStream.newLineAtOffset(titleX, 750); // Set the position for the title (top center)
            contentStream.showText(title); // Display the title
            contentStream.endText();

            // Set the font and font size for the content
            contentStream.setFont(PDType1Font.HELVETICA, 12);

            // Split the content into lines with line breaks every 60 characters
            List<String> lines = splitContent(content, pageWidth - 100, PDType1Font.HELVETICA, 12);

            // Starting y position for the content
            float y = 700;

            // Loop through each line of content
            for (String line : lines) {
                // Calculate the X offset to center the text horizontally
                float textWidth = PDType1Font.HELVETICA.getStringWidth(line) / 1000f * 12;
                float xOffset = (pageWidth - textWidth) / 2f;

                // Write each line as a separate paragraph
                contentStream.beginText();
                contentStream.newLineAtOffset(xOffset, y); // Set the position for the text
                contentStream.showText(line); // Display the line
                contentStream.endText();
                y -= 20; // Move to the next line
            }

            // Close the content stream
            contentStream.close();

            // Save the PDF document to a byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            document.close();

            // Specify the directory where you want to save the PDF
            String uploadDir = "attestations";

            // Create the directory if it doesn't exist
            if (!Files.exists(Paths.get(uploadDir))) {
                Files.createDirectories(Paths.get(uploadDir));
            }

            // Generate a unique file name for the PDF
            String fileName = "generated_pdf_" + System.currentTimeMillis() + ".pdf";

            // Write the PDF content to the file
            FileUtils.writeByteArrayToFile(new File(uploadDir + File.separator + fileName), outputStream.toByteArray());
            Attestation attestation = new Attestation();
            attestation.setName(pdfName); // Set pdfName
            String pdfPath = uploadDir + File.separator + fileName;
            attestation.setPdfPath(pdfPath); // Set pdfName
            attestation.setExist(true); // Set pdfName
            attestationRepository.save(attestation); // Save the object using your repository

            // Return the path to the saved PDF file
            return ResponseEntity.ok(uploadDir + File.separator + fileName);
        } catch (IOException e) {
            e.printStackTrace();
            // Return an error response if PDF generation fails
            return ResponseEntity.status(500).body("Failed to generate PDF");
        }
    }

    // Function to split the content into lines with line breaks every n characters
    // Helper method to split content into lines with proper line wrapping
    private List<String> splitContent(String content, float maxWidth, PDFont font, int fontSize) throws IOException {
        List<String> lines = new ArrayList<>();
        StringBuilder sb = new StringBuilder();

        for (String word : content.split("\\s+")) {
            if (font.getStringWidth(sb + word) / 1000 * fontSize > maxWidth) {
                lines.add(sb.toString());
                sb = new StringBuilder();
            }
            sb.append(word).append(" ");
        }
        lines.add(sb.toString());

        return lines;
    }


    @GetMapping("/attestations")
    public ResponseEntity<List<Attestation>> getAllAttestations() {
        List<Attestation> attestations = attestationRepository.findAll();
        return ResponseEntity.ok().body(attestations);


    }

    @GetMapping("/pdfsUser/{fileName:.+}")
    @ResponseBody
    public ResponseEntity<Resource> getPdf(
            @PathVariable String fileName,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) throws IOException {
        Path filePath = Paths.get("attestations").resolve(fileName).normalize();

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        // Load existing PDF document
        try (PDDocument document = PDDocument.load(filePath.toFile())) {
            // Get the first page of the document
            PDPage firstPage = document.getPage(0);

            // Define the padding from the left and bottom edges
            float padding = 50; // Adjust as needed

            // Calculate the coordinates for the user details text
            float x = padding;
            float y = padding;

            // Add user-specific data to the first page
            try (PDPageContentStream contentStream = new PDPageContentStream(document, firstPage, PDPageContentStream.AppendMode.APPEND, true)) {
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();

                // Position the text at the specified coordinates
                contentStream.newLineAtOffset(x, y);
                contentStream.showText("User ID: " + userId);
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Username: " + username);
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Email: " + email);
                contentStream.endText();
            }

            // Save the modified document to a ByteArrayOutputStream
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);

            // Return the modified PDF as a response
            ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
            InputStreamResource modifiedResource = new InputStreamResource(bais);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentLength(baos.size());
            headers.setContentDispositionFormData("inline", fileName);

            return new ResponseEntity<>(modifiedResource, headers, HttpStatus.OK);
        }
    }



    @GetMapping("/pdfs/{fileName:.+}")
    @ResponseBody
    public ResponseEntity<Resource> getPdf(@PathVariable String fileName) throws IOException {
        // Adjust the base path according to your file storage configuration
        String basePath = "attestations";
        String filePath = Paths.get(basePath, fileName).toString();
        System.out.println("filePath"+filePath);
        Path pdfPath = Paths.get(filePath);
        System.out.println("pdfPath"+pdfPath);
        if (!Files.exists(pdfPath)) {
            System.out.println("aaaaaaaaaaaa");

            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(pdfPath.toUri());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentLength(resource.contentLength());
        headers.setContentDispositionFormData("attachment", fileName);

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }



    @DeleteMapping("/attestations/{attestationId}")
    public ResponseEntity<?> deleteAttestation(@PathVariable Long attestationId) throws IOException {
        Optional<Attestation> attestationOptional = attestationRepository.findById(attestationId);
        if (attestationOptional.isPresent()) {
            // Delete the PDF file associated with the attestation
            String pdfPath = attestationOptional.get().getPdfPath();
            if (pdfPath != null && !pdfPath.isEmpty()) {

                Files.deleteIfExists(Paths.get(pdfPath));
            }

            // Delete the attestation entry from the database
            attestationRepository.deleteById(attestationId);

            // Return a success response with a custom message
            return ResponseEntity.ok().body("Attestation deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId}/name")
    public String getUserName(@PathVariable Long userId) {
        return userService.getUserNameById(userId);
    }
    // Update existing attestation
    @PostMapping("/UpdateAttestation")
    public ResponseEntity<?> updateAttestation(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("id") Long id,
            @RequestParam("name") String name,
            @RequestParam("isExist") boolean isExist) {
        try {
            Optional<Attestation> optionalAttestation = attestationService.findById(id);
            if (optionalAttestation.isPresent()) {
                Attestation attestation = optionalAttestation.get();

                // Update name and existence status
                attestation.setName(name);
                attestation.setExist(isExist);

                // Update PDF path if a new file is provided
                if (file != null) {
                    String fileName = StringUtils.cleanPath(FilenameUtils.getBaseName(file.getOriginalFilename()) + "_" + System.currentTimeMillis() + "." + FilenameUtils.getExtension(file.getOriginalFilename()));
                    Path uploadDir = Paths.get(UPLOAD_DIR);
                    if (!Files.exists(uploadDir)) {
                        Files.createDirectories(uploadDir);
                    }
                    Files.copy(file.getInputStream(), uploadDir.resolve(fileName));

                    String pdfPath = UPLOAD_DIR + "/" + fileName;
                    attestation.setPdfPath(pdfPath);
                }

                // Save updated attestation in the database
                attestationService.saveAttestation(attestation);

                // Return success response with a custom message
                return ResponseEntity.ok().body("Attestation updated successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            // If an exception occurs, return a server error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update attestation");
        }
    }

}
