package com.projectscale.projectscale.config;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.projectscale.projectscale.entity.User;
import com.projectscale.projectscale.repository.UserRepository;
@Configuration
public class SeedAdmin {
    @Bean
    CommandLineRunner init(UserRepository userRepository) {
        return args -> {
               String password = "admin123";
               BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
               String hashedPassword = passwordEncoder.encode(password);
               if (!userRepository.existsByemail("admin@gmail.com")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@gmail.com");
                admin.setPasswordHash(hashedPassword); // Pre-hashed password for "admin123"
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Admin user created: admin / admin123");
            }
        };
}
}
