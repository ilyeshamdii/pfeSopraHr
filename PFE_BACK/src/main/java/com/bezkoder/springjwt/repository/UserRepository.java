package com.bezkoder.springjwt.repository;

import java.util.List;
import java.util.Optional;

import com.bezkoder.springjwt.models.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bezkoder.springjwt.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {


	Boolean existsByUsername(String username);
	Optional<User> findByUsername(String name);
	Optional<User> findByResetToken(String resetToken);
	Optional<User> findByEmail(String email);
	Boolean existsByEmail(String email);
	Optional<User> findById(Long id); // Use findById to retrieve a user by ID
	@Query("SELECT u FROM User u JOIN u.roles r WHERE r.id IN :roleIds")
	List<User> findByRoleIds(@Param("roleIds") List<Integer> roleIds);
}
