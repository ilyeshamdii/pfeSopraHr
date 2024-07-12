package com.bezkoder.springjwt.security.services;

import com.bezkoder.springjwt.models.Badge;
import com.bezkoder.springjwt.repository.BadgeRepository;
import com.bezkoder.springjwt.util.BadgeNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BadgeService {
    @Autowired
    private BadgeRepository badgeRepository;
    public boolean hasAcceptedBadge(Long userId) {
        // Check if the user has a badge with status "accepter"
        Badge badge = badgeRepository.findByUserIdAndStatus(userId, "accepter");
        return badge != null;
    }
    public String findBadgeStatusByUserId(Long userId) throws BadgeNotFoundException {
        List<Badge> badges = badgeRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
        if (badges.isEmpty()) {
            throw new BadgeNotFoundException("Badge not found for userId: " + userId);
        }
        // Assuming you need the status of the first badge or you can add logic to find a specific status
        return badges.get(0).getStatus();
    }
    public Badge acceptBadge(Long badgeId) {
        Badge badge = badgeRepository.findById(badgeId).orElseThrow(() -> new RuntimeException("Badge not found"));
        badge.setStatus("accepter");
        badgeRepository.save(badge);
        return badge;
    }

    public Badge refuseBadge(Long badgeId) {
        Badge badge = badgeRepository.findById(badgeId).orElseThrow(() -> new RuntimeException("Badge not found"));
        badge.setStatus("refuser");

        badgeRepository.save(badge);
        return badge;
    }

    @Transactional
    public void deleteBadgeRequestByUserId(Long userId) {

        badgeRepository.deleteByUserId(userId);
    }
    @Transactional
    public void setBadgesAsDeletedByUserId(Long userId) {
        List<Badge> badges = badgeRepository.findByUser_Id(userId);
        badges.forEach(badge -> {
            badge.setDeleted(true); // Set isDeleted to true
            // Optionally, you can save the badge if necessary
            badgeRepository.save(badge);
        });
    }

    public boolean isBadgeDeleted(Long userId) throws BadgeNotFoundException {
        Badge badge = badgeRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
        if (badge == null) {
            throw new BadgeNotFoundException("Badge not found for userId: " + userId);
        }
        return badge.isDeleted();
    }
    public Badge findLastBadgeRequestByUserId(Long userId) throws BadgeNotFoundException {
        List<Badge> badges = badgeRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
        if (badges.isEmpty()) {
            throw new BadgeNotFoundException("No badge request found for userId: " + userId);
        }
        return badges.get(0);
    }

}
