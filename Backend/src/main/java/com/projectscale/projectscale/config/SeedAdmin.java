package com.projectscale.projectscale.config;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.projectscale.projectscale.entity.User;
import com.projectscale.projectscale.repository.UserRepository;
@Configuration
public class SeedAdmin {
    @Bean
    CommandLineRunner init(UserRepository userRepository) {
        return args -> {
             
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@gmail.com");
                admin.setPasswordHash("$2a$10$7Qy8s1m"); // Pre-hashed password for "admin123"
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Admin user created: admin / admin123");
            }
        };
}
