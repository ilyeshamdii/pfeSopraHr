package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Entity
@Getter
@Setter

public class Conger_Maladie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Lob
    private String message;
    @ManyToOne
    @JoinColumn(name = "user_id") // Define the foreign key column name
    private User user; // Reference to the User entity
    @Temporal(TemporalType.DATE)
    private Date dateDebut;
    private String status = "IN_PROGRESS";
    @Temporal(TemporalType.DATE)
    private Date dateFin;
    private String typeConger; // New attribute: type of leave

    private String justificationPath; // Path to the file

}
