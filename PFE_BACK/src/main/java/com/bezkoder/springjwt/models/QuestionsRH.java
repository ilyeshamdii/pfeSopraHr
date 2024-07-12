package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@Table(name = "questionsrh")
public class QuestionsRH {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String categories;

    @Column(name = "sous_categories")
    private String sousCategories;

    private String titre;

    private String descriptions;

    @Column(name = "pieces_joint")
    private String piecesJoint;

    @Column(name = "user_id")
    private Long userId;

    // Constructors, getters, and setters
    // Omitted for brevity
}
