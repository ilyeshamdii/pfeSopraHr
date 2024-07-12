package com.bezkoder.springjwt.security.services;

import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.data.domain.Sort;

import javax.transaction.Transactional;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    UserRepository repository;

    public void save(User User) {
        System.out.println("save  all Users 11111...");
        repository.save(User);
    }
    public Optional<User> findUserByEmail(String email) {
        return repository.findByEmail(email);
    }
    @Async
    public  void sendEmail(SimpleMailMessage email) {
        mailSender.send(email);
    }
    public Optional <User> findUserByResetToken(String resetToken) {
        return repository.findByResetToken(resetToken);
    }
    public Optional<User> login(String name) {
        System.out.println(name);
        return repository.findByUsername(name);
    }
    public List<User> getAll() {
        System.out.println("Get all Users 11111...");
        return repository.findAll(Sort.by("username").ascending());
    }
    public User getUserById(Long userId) {
        Optional<User> userOptional = repository.findById(userId);
        return userOptional.orElse(null);
    }
    public String getUserNameById(Long userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getUsername();
    }
    public Optional<User> getUserByUsername(String username) {
        return repository.findByUsername(username);
    }
}
