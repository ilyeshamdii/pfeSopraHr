package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.Attestation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttestationRepository extends JpaRepository<Attestation, Long> {
}
