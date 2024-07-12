package com.bezkoder.springjwt;

import com.bezkoder.springjwt.models.ERole;
import com.bezkoder.springjwt.models.Role;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.repository.RoleRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class InitialDataLoader implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles
        initRoles();

        // Initialize admin user
        initAdmin();
    }

    private void initRoles() {
        // Check if roles exist
        if (roleRepository.findByName(ERole.ROLE_MANAGER).isEmpty()) {
            // Roles don't exist, so insert them
            Role managerRole = new Role(ERole.ROLE_MANAGER);
            Role collaborateurRole = new Role(ERole.ROLE_COLLABORATEUR);
            Role gestionnaireRole = new Role(ERole.ROLE_GESTIONNAIRE);

            roleRepository.save(managerRole);
            roleRepository.save(collaborateurRole);
            roleRepository.save(gestionnaireRole);
        }
    }

    private void initAdmin() {
        // Check if admin user exists
        if (userRepository.existsByUsername("gestionnaire")) {
            return;
        }

        // Create admin user
        User admin = new User();
        admin.setUsername("gestionnaire");
        admin.setEmail("admin@admin.com");
        admin.setPassword(passwordEncoder.encode("admin"));

        Set<Role> roles = new HashSet<>();
        Role managerRole = roleRepository.findByName(ERole.ROLE_GESTIONNAIRE)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(managerRole);
        admin.setRoles(roles);
        admin.setStatus(true); // Set status to true

        userRepository.save(admin);
    }
}
