package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String fileName;
    private String message;
    private String username;
    private LocalDateTime timestamp;
    private boolean isAdmin; // New attribute
    private boolean isManager; // New attribute


}
