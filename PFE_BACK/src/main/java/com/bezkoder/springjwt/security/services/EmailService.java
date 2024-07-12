package com.bezkoder.springjwt.security.services;

import com.bezkoder.springjwt.models.Attestation;
import com.bezkoder.springjwt.models.DemandeAttestations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Files;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    public void sendDemandeAttestationsEmail(String to, DemandeAttestations demande, Attestation attestation) throws MessagingException {
        String subject = "Request Status: " + demande.getIsApproved();
        String body = generateEmailBody(demande, attestation);

        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true); // true indicates multipart message

        try {
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true indicates HTML content
            Path pdfPath = Path.of(attestation.getPdfPath());
            byte[] pdfBytes = Files.readAllBytes(pdfPath);
            helper.addAttachment("attestation.pdf", new ByteArrayResource(pdfBytes));
            emailSender.send(message);
        } catch (MessagingException e) {
            // Handle exception
            e.printStackTrace();
            throw e; // Rethrow the exception to propagate it
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String generateEmailBody(DemandeAttestations demande, Attestation attestation) {
        StringBuilder sb = new StringBuilder();
        sb.append("<h2 style=\"color: #007bff;\">Demande Attestations Details</h2>");
        sb.append("<ul>");
        sb.append("<li><strong>ID:</strong> <span style=\"color: #28a745;\">" + demande.getId() + "</span></li>");
        sb.append("<li><strong>Attestation Name:</strong> " + attestation.getName() + "</li>");
        sb.append("<li><strong>Is Approved:</strong> <span style=\"color: #dc3545;\">" + demande.getIsApproved() + "</span></li>");
        // Add more details as needed
        sb.append("</ul>");

        return sb.toString();
    }

}
