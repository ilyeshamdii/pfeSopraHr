package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.QuestionsRH;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionsRHRepository  extends JpaRepository<QuestionsRH, Long> {
    List<QuestionsRH> findByUserId(Long userId);

}
