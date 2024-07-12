package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;
    private String recipient;
    private String content;
    private LocalDateTime timestamp;
    private String fileName;
    private Long userId; // Add userId field

    // Constructors, Getters, and Setters
    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }

    // other getters and setters
}
