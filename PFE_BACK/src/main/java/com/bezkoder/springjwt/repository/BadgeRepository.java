package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.Badge;
import com.bezkoder.springjwt.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Badge findByUserIdAndStatus(Long userId, String status);
    List<Badge> findByUser(User user);
    void deleteByUserId(Long userId);
    List<Badge> findByUserAndIsDeleted(User user, boolean isDeleted);
    List<Badge> findByUser_Id(Long userId);
    List<Badge> findByUserId(Long userId);
    List<Badge> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    Badge findTopByUserIdOrderByCreatedAtDesc(Long userId);

}
