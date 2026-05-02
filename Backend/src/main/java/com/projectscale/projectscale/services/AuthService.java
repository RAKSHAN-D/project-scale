package com.projectscale.projectscale.services;

import com.projectscale.projectscale.entity.*;
import com.projectscale.projectscale.dto.*;
import com.projectscale.projectscale.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.projectscale.projectscale.Auth.JwtUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@Service
public class AuthService  {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    } 
    public UserResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.SECOND_CLASS); // Default role
        return toUserResponse(userRepository.save(user));
    }
     private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole() != null ? user.getRole().name() : null);
        return response;
    }

    public String login(LoginRequest request) {
       authManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
      User user = userRepository.findByUsername(request.getUsername())
        .orElseThrow(() -> new RuntimeException("User not found"));
        return jwtUtil.generateToken(user);
    }

    public String logout() {
        // Add any additional logout logic here
        // Invalidate the token on the client side (e.g., remove it from local storage)
        return "Logged out successfully";
    }

}