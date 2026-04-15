package com.projectscale.services;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.projectscale.projectscale.dto.CreateUserRequest;
import com.projectscale.projectscale.dto.UpdateUserRequest;
import com.projectscale.projectscale.dto.UserResponse;
import com.projectscale.projectscale.entity.User;
import com.projectscale.projectscale.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder; // Constructor injection of the repository and password encoder
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createUser(CreateUserRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()
                || request.getEmail() == null || request.getEmail().trim().isEmpty()
                || request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Username, email, and password are required.");
        }

        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword().trim();

        if (repo.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists.");
        }
        if (repo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists.");
        }
        if (rawPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));

        return toUserResponse(repo.save(user));
    }

    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public UserResponse getUserById(Long id) {
        User user = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found."));
        return toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return repo.findAll().stream().map(this::toUserResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public UserResponse updateUser(Long id, UpdateUserRequest updatedUser) {
        User user = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (updatedUser.getUsername() != null && !updatedUser.getUsername().trim().isEmpty()) {
            String normalizedUsername = updatedUser.getUsername().trim().toLowerCase();
            if (isExistingUsername(normalizedUsername, id)) {
                throw new IllegalArgumentException("Username already exists.");
            }
            user.setUsername(normalizedUsername);
        }

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().trim().isEmpty()) {
            String normalizedEmail = updatedUser.getEmail().trim().toLowerCase();
            if (isExistingEmail(normalizedEmail, id)) {
                throw new IllegalArgumentException("Email already exists.");
            }
            user.setEmail(normalizedEmail);
        }

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(updatedUser.getPassword().trim()));
        }

        return toUserResponse(repo.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("User not found.");
        }
        repo.deleteById(id);
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole() != null ? user.getRole().name() : null);
        return response;
    }

    private boolean isExistingUsername(String username, Long currentUserId) {
        return repo.findByUsername(username)
                .map(existing -> !existing.getId().equals(currentUserId))
                .orElse(false);
    }
    private boolean isExistingEmail(String email, Long currentUserId) {
        return repo.findByEmail(email)
                .map(existing -> !existing.getId().equals(currentUserId))
                .orElse(false);
    }
}
