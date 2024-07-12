package com.bezkoder.springjwt.repository;


import com.bezkoder.springjwt.models.Conger_Maladie;
import com.bezkoder.springjwt.models.Donner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DonnerRepository  extends JpaRepository<Donner, Long>{

    Optional<Donner> findByCongerMaladieId(Long congerMaladieId);
    @Query("SELECT d.durationInDays FROM Donner d WHERE d.congerMaladie.id = :congerMaladieId")
    Long getDurationInDaysByCongerMaladieId(@Param("congerMaladieId") Long congerMaladieId);
    List<Donner> findByCongerMaladie(Conger_Maladie congerMaladie);

}
