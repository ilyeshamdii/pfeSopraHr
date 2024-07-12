package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.Conger_Maladie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface CongerMaladieRepository extends JpaRepository<Conger_Maladie, Long> {

    @Query("SELECT COUNT(c) FROM Conger_Maladie c WHERE c.user.id = :userId AND c.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    List<Conger_Maladie> findByUserIdAndStatus(Long userId, String status);
    @Query("SELECT c FROM Conger_Maladie c WHERE c.user.id = :userId")
    List<Conger_Maladie> findByUserId(Long userId);
}

