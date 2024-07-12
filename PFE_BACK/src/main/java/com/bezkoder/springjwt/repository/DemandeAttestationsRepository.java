package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.DemandeAttestations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DemandeAttestationsRepository extends JpaRepository<DemandeAttestations, Long> {

    @Query("SELECT da FROM DemandeAttestations da WHERE da.user_id = :userId AND da.creationDate BETWEEN :startDate AND :endDate")
    List<DemandeAttestations> findByUserIdAndCreationDateBetween(@Param("userId") String userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
