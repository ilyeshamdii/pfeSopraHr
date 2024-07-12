package com.bezkoder.springjwt.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Setter
@Getter
public class JwtResponse {
	private String token;
	private String type = "Bearer";
	private Long id;
	private String photos;
	private Boolean status;

	private String username;
	private String email;
	private List<String> roles;

	public JwtResponse(String accessToken, Long id, String username, String photos, String email, Boolean status, List<String> roles) {
		this.token = accessToken;
		this.id = id;
		this.username = username;
		this.photos = photos;
		this.email = email;
		this.status = status;
		this.roles = roles;
	}

	public String getAccessToken() {
		return token;
	}

	public void setAccessToken(String accessToken) {
		this.token = accessToken;
	}

	public String getTokenType() {
		return type;
	}

	public void setTokenType(String tokenType) {
		this.type = tokenType;
	}


}
