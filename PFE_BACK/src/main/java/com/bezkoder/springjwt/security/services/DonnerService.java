package com.bezkoder.springjwt.security.services;

import com.bezkoder.springjwt.Dto.DonnerDTO;
import com.bezkoder.springjwt.models.Donner;
import com.bezkoder.springjwt.repository.DonnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service

public class DonnerService {

    @Autowired
    private DonnerRepository donnerRepository;

    public Optional<DonnerDTO> getDonnerByCongerMaladieId(Long congerMaladieId) {
        Optional<Donner> donner = donnerRepository.findByCongerMaladieId(congerMaladieId);
        return donner.map(this::convertToDto);
    }
    private DonnerDTO convertToDto(Donner donner) {
        DonnerDTO dto = new DonnerDTO();
        dto.setId(donner.getId());
        dto.setCongerMaladieId(donner.getCongerMaladie().getId());
        dto.setSoldeCongerId(donner.getSoldeConger().getId());
        dto.setDurationInDays(donner.getDurationInDays());
        return dto;
    }

}
