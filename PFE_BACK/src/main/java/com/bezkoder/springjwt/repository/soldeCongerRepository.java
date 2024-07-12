package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.SoldeConger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository

public interface soldeCongerRepository extends JpaRepository<SoldeConger, Long> {
    SoldeConger findByUserId(Long userId);
    @Query("SELECT s FROM SoldeConger s WHERE s.user.id = :userId")
    Optional<SoldeConger> findByUserIds(@Param("userId") Long userId);

}
