package com.bezkoder.springjwt.payload.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

import javax.persistence.Column;
import javax.validation.constraints.*;
 
@Setter
@Getter
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;
 
    @NotBlank
    @Size(max = 50)
    @Email
    private String email;
    
    private Set<String> role;
    @Column(length = 64)
    private String photos;
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

}
