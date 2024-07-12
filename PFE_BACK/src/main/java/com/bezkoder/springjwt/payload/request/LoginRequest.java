package com.bezkoder.springjwt.payload.request;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
@Getter
@Setter
public class LoginRequest {
	@Setter
	@Getter
	@NotBlank
	private String username;

	@Getter
	@NotBlank
	private String password;
	private String fileName;
	private String resetToken;
	private LocalDateTime dateToken;

}
