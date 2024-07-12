package com.bezkoder.springjwt.models;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Entity
@Setter
@Getter
public class Attestation {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String pdfPath;
    private boolean isExist;
    @Temporal(TemporalType.DATE)
    @Column(name = "creation_date")
    private Date creationDate;

    // Constructors, getters, and setters

    public Attestation() {
        this.creationDate = new Date(); // Set current date

    }

    public Attestation(String name, String pdfPath, boolean isExist) {
        this.name = name;
        this.pdfPath = pdfPath;
        this.isExist = isExist;
        this.creationDate = new Date(); // Set current date

    }

    public Attestation(String name, boolean isExist) {
        this.isExist = isExist;
        this.name = name;
        this.creationDate = new Date(); // Set current date

    }

    // Getters and setters




}
