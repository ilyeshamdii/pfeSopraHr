package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.MessageDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository

public interface MessageDetailsRepository extends JpaRepository<MessageDetails, Long> {
    Long countByIsClickedFalse();
    @Transactional
    @Modifying
    @Query("UPDATE MessageDetails md SET md.isClicked = true")
    void updateAllIsClickedToFalse();
}
