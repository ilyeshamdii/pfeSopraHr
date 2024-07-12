package com.bezkoder.springjwt.security.services;

import com.bezkoder.springjwt.repository.MessageDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
public class messageDetailsService {
    @Autowired
    private  MessageDetailsRepository messageDetailsRepository;



    @Transactional
    public void updateAllIsClickedToFalse() {
        messageDetailsRepository.updateAllIsClickedToFalse();
    }
}
