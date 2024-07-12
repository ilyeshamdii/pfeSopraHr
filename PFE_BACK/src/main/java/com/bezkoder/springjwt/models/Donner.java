package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
public class Donner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "conger_maladie_id")
    private Conger_Maladie congerMaladie;
    @ManyToOne
    @JoinColumn(name = "solde_conger_id")
    private SoldeConger soldeConger;

    private long durationInDays;

    // Constructors, getters, setters, and other fields
}
