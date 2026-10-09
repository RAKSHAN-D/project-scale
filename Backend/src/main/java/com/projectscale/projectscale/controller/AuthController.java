package com.projectscale.projectscale.controller;

import com.projectscale.projectscale.dto.LoginRequest;
import com.projectscale.projectscale.dto.LoginResponse;
import com.projectscale.projectscale.dto.SignupRequest;
import com.projectscale.projectscale.dto.SignupResponse;
import com.projectscale.projectscale.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    //  User Signup
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(
            @Valid @RequestBody SignupRequest request) {

        SignupResponse response = authService.signup(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    //  User Login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    //  User Logout
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {

        return ResponseEntity.ok(authService.logout());
    }
}
