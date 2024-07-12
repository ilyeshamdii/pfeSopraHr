package com.bezkoder.springjwt.controllers;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import com.bezkoder.springjwt.payload.request.UpdateUserRequest;
import com.bezkoder.springjwt.security.services.UserService;
import com.bezkoder.springjwt.util.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import com.bezkoder.springjwt.models.ERole;
import com.bezkoder.springjwt.models.Role;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.payload.request.LoginRequest;
import com.bezkoder.springjwt.payload.request.SignupRequest;
import com.bezkoder.springjwt.payload.response.JwtResponse;
import com.bezkoder.springjwt.payload.response.MessageResponse;
import com.bezkoder.springjwt.repository.RoleRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import com.bezkoder.springjwt.security.jwt.JwtUtils;
import com.bezkoder.springjwt.security.services.UserDetailsImpl;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
	@Autowired
	AuthenticationManager authenticationManager;

	@Autowired
	UserRepository userRepository;

	@Autowired
	RoleRepository roleRepository;

	@Autowired
	PasswordEncoder encoder;

	@Autowired
	JwtUtils jwtUtils;
    @Autowired
    PasswordEncoder passwordEncoder; // Add this import
	@Autowired
	private UserService userService;
	private static final long EXPIRE_TOKEN_AFTER_MINUTES = 30;

	@PostMapping("/signin")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		String jwt = jwtUtils.generateJwtToken(authentication);
		
		UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();		
		List<String> roles = userDetails.getAuthorities().stream()
				.map(item -> item.getAuthority())
				.collect(Collectors.toList());

		return ResponseEntity.ok(new JwtResponse(jwt, 
												 userDetails.getId(), 
												 userDetails.getUsername(),
												 userDetails.getPhotos(),
												 userDetails.getEmail(),
												 userDetails.getStatus(),
												 roles));
	}
	@GetMapping("/images/{userId}/{fileName}")
	public ResponseEntity<byte[]> getImage(@PathVariable Long userId, @PathVariable String fileName) throws IOException {

		Optional<User> userOptional = userRepository.findById(userId);
		if (userOptional.isEmpty()) {
			String errorMessage = "User not found with ID: " + userId;
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage.getBytes());
		}
		// Construct the path to the image file
		String filePath = "user-photos/" + userId + "/" + fileName;
		Path path = Paths.get(filePath);

		if (!Files.exists(path)) {
			String errorMessage = "Image not found for user ID: " + userId + " and file name: " + fileName;
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage.getBytes());
		}

		// Read the image file as bytes
		byte[] imageData = Files.readAllBytes(path);

		// Set content type header
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.IMAGE_JPEG); // Adjust content type as needed

		// Serve the image data as a response
		return ResponseEntity.ok().headers(headers).body(imageData);
	}



	@PostMapping("/signup")
	public ResponseEntity<?> registerUser(@Valid SignupRequest signUpRequest,
										  @RequestParam(value = "image", required = false) MultipartFile multipartFile)
			throws IOException {

		if (userRepository.existsByUsername(signUpRequest.getUsername())) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: Username is already taken!"));
		}

		if (userRepository.existsByEmail(signUpRequest.getEmail())) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: Email is already in use!"));
		}

		// Set the user's password using encoder
		User user = new User(signUpRequest.getUsername(),
				signUpRequest.getEmail(),
				encoder.encode(signUpRequest.getPassword()));

		// Fetch roles based on role names provided in SignUpRequest
		Set<Role> roles = new HashSet<>();
		for (String roleName : signUpRequest.getRole()) {
			Role role = roleRepository.findByName(ERole.valueOf(roleName))
					.orElseThrow(() -> new RuntimeException("Error: Role not found: " + roleName));
			roles.add(role);
		}
		user.setRoles(roles);

		// Check if multipartFile is not null before accessing it
		String fileName = null;
		if (multipartFile != null) {
			fileName = StringUtils.cleanPath(Objects.requireNonNull(multipartFile.getOriginalFilename()));
			user.setPhotos(fileName);
		}

		// Save user to database
		User savedUser = userRepository.save(user);

		// Save image file if multipartFile is not null
		if (multipartFile != null) {
			String uploadDir = "user-photos/" + savedUser.getId();
			FileUploadUtil.saveFile(uploadDir, fileName, multipartFile);
		}

		return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
	}



    @GetMapping("/users/verif/{email}")
    public ResponseEntity<MessageResponse> findUserByEmail(@PathVariable String email, HttpServletRequest request) {
        Optional<User> user = userService.findUserByEmail(email);
        String appUrl = request.getScheme() + "://" + request.getServerName() + ":4200";
        if (!user.isPresent()) {
            System.out.println("We didn't find an account for that e-mail address.");
			return ResponseEntity.badRequest().body(new MessageResponse("We didn't find an account for that e-mail address"));

		} else {
            User userr = user.get();

                userr.setDateToken(LocalDateTime.now());
                userr.setResetToken(UUID.randomUUID().toString());
                userService.save(userr);
                SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
                simpleMailMessage.setFrom("testab.symfony@gmail.com");
                simpleMailMessage.setTo(userr.getEmail());
                simpleMailMessage.setSubject("Password Reset Request");
                simpleMailMessage.setText("Pou récupérer votre Mot De passe cliquer sur ce Lien :\n" + appUrl
                        + "/resetpwd?token=" + userr.getResetToken());
                System.out.println(userr.getResetToken());
                userService.sendEmail(simpleMailMessage);
                return ResponseEntity.ok(new MessageResponse("Password reset link has been sent to your email address"));

        }
    }
    @GetMapping("/users/rest/{resetToken}/{password}")
    public ResponseEntity<MessageResponse> findUserByResetToken(@PathVariable String resetToken, @PathVariable String password) {
        System.out.println(password);

        Optional<User> user = userService.findUserByResetToken(resetToken);
        if (!user.isPresent()) {
            System.out.println("We didn't find an account for that Token");
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("We didn't find an account for that Token"));


		} else {
            User userr = user.get();
            LocalDateTime tokenCreationDate = userr.getDateToken();

            if (isTokenExpired(tokenCreationDate)) {
                System.out.println("Token expired.");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Token expired"));

			}
            String encodedPassword = passwordEncoder.encode(password);


            userr.setPassword(encodedPassword);
            userr.setResetToken(null);
            userr.setDateToken(null);
            userService.save(userr);

			return ResponseEntity.status(HttpStatus.OK).body(new MessageResponse("Password reset successful"));

		}
    }



	/**
	 * Check whether the created token expired or not.
	 *
	 * @param tokenCreationDate
	 * @return true or false
	 */
	private boolean isTokenExpired(final LocalDateTime tokenCreationDate) {

		LocalDateTime now = LocalDateTime.now();
		Duration diff = Duration.between(tokenCreationDate, now);

		return diff.toMinutes() >= EXPIRE_TOKEN_AFTER_MINUTES;
	}

	@PutMapping("/update/{userId}")
	public ResponseEntity<?> updateUser(@PathVariable Long userId,
										@RequestParam(value = "image", required = false) MultipartFile image,
										@RequestParam(value = "username", required = false) String username,
										@RequestParam(value = "email", required = false) String email
										) throws IOException {
		Optional<User> userOptional = userRepository.findById(userId);
		if (userOptional.isEmpty()) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: User not found with ID: " + userId));
		}

		User user = userOptional.get();

		// Update email if provided in the request
		if (email != null && !email.isEmpty()) {
			user.setEmail(email);
		}

		// Update username if provided in the request
		if (username != null && !username.isEmpty()) {
			user.setUsername(username);
		}

		// Update password if provided in the request


		// Update user's photo if provided in the request
		if (image != null) {
			String fileName = StringUtils.cleanPath(Objects.requireNonNull(image.getOriginalFilename()));
			user.setPhotos(fileName);

			// Save image file
			String uploadDir = "user-photos/" + userId;
			FileUploadUtil.saveFile(uploadDir, fileName, image);
		}

		// Save updated user to the database
		userRepository.save(user);

		return ResponseEntity.ok(new MessageResponse("User updated successfully!"));
	}

	@PutMapping("/updatePassword/{userId}")
	public ResponseEntity<?> updatePassword(@PathVariable Long userId, @RequestBody Map<String, String> passwordRequest) {
		Optional<User> userOptional = userRepository.findById(userId);
		if (userOptional.isEmpty()) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: User not found with ID: " + userId));
		}

		User user = userOptional.get();

		String currentPassword = passwordRequest.get("currentPassword");
		String newPassword = passwordRequest.get("newPassword");

		// Check if the current password matches
		if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: Current password is incorrect"));
		}

		// Update password
		user.setPassword(encoder.encode(newPassword));

		// Save updated user to the database
		userRepository.save(user);

		return ResponseEntity.ok(new MessageResponse("Password updated successfully!"));
	}

}

