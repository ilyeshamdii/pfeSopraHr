package com.bezkoder.springjwt.security.services;

import com.bezkoder.springjwt.models.Attestation;
import com.bezkoder.springjwt.repository.AttestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service

public class AttestationService {
    @Autowired
    private AttestationRepository attestationRepository;
    public Optional<Attestation> getAttestationById(Long id) {
        return attestationRepository.findById(id);
    }
    public Attestation saveAttestation(Attestation attestation) {
        return attestationRepository.save(attestation);
    }
    public Optional<Attestation> findById(Long id) {
        return attestationRepository.findById(id);
    }
}
