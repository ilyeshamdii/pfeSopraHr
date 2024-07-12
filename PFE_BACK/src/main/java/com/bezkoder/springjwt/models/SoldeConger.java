package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.List;

@Getter
@Setter
@Entity
public class SoldeConger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Getters and setters
    // Constructors
    // Other fields and methods
    @OneToMany(mappedBy = "soldeConger", cascade = CascadeType.ALL)
    private List<Donner> donners;
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;


    private long solde = 30; // Default value set to 30

    private long oldSoldConger; // New attribute: old sold conger

}
