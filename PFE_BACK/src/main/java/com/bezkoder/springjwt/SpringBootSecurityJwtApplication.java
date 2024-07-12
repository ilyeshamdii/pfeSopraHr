package com.bezkoder.springjwt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.annotation.PostConstruct;
import java.io.File;
@SpringBootApplication
public class SpringBootSecurityJwtApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringBootSecurityJwtApplication.class, args);
	}
	@PostConstruct
	public void init() {
		// Create the uploads directory if it doesn't exist
		String uploadsDir = "uploads";
		File directory = new File(uploadsDir);
		if (!directory.exists()) {
			directory.mkdir();
		}
	}
}
