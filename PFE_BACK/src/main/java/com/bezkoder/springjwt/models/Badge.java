package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime; // Import LocalDateTime

@Entity
@Getter
@Setter
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String username;
    private String matricule;
    private String status;
    private String photos;
    private boolean isDeleted = false;

    // Add createdAt field
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Badge() {
        this.createdAt = LocalDateTime.now(); // Initialize createdAt with current time
    }

    // Getters and setters
    // Ensure to add getters and setters for createdAt field


}
