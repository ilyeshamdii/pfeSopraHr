package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "DemandeAttestations")
public class DemandeAttestations {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String isApproved = "en cours"; // Default value is "en cours"

    @Column(name = "creation_date")
    private LocalDate creationDate;

    private String user_id;



    private String attestation_id;

    public DemandeAttestations() {
    }
    // Constructor

    public DemandeAttestations(Long id, String isApproved, String user_id, String attestation_id) {
        this.id = id;
        this.isApproved = isApproved;
        this.user_id = user_id;
        this.attestation_id = attestation_id;
    }
}
