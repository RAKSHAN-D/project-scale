package com.projectscale.projectscale.config;

import com.projectscale.projectscale.auth.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import java.time.OffsetDateTime;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class AuthSecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public AuthSecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }
//  Main Security Configuration with JWT Authentication
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .anyRequest().authenticated()
            )

            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) ->
                    writeSecurityError(
                        response,
                        HttpStatus.UNAUTHORIZED,
                        "Authentication required",
                        request.getRequestURI()
                    )
                )
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    writeSecurityError(
                        response,
                        HttpStatus.FORBIDDEN,
                        "Access denied",
                        request.getRequestURI()
                    )
                )
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    //  AuthenticationManager Bean
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    private void writeSecurityError(
            HttpServletResponse response,
            HttpStatus status,
            String message,
            String path) throws java.io.IOException {

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
                {"timestamp":"%s","status":%d,"error":"%s","message":"%s","path":"%s"}"""
                .formatted(
                        OffsetDateTime.now(),
                        status.value(),
                        escapeJson(status.getReasonPhrase()),
                        escapeJson(message),
                        escapeJson(path)));
    }

    private String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
