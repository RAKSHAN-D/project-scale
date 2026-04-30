package com.projectscale.projectscale.auth;

import jakarta.servlet.FilterChain;// FilterChain is used to pass the request and response to the next filter in the chain after processing.
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*; // HttpServletRequest, HttpServletResponse, access to "Authorization" header.
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder; // Storage Box for the current authenticated user details. It allows access to the security context, which holds the authentication and authorization information for the current user.
import org.springframework.security.core.userdetails.UserDetails; // UserDetails is a core interface in Spring Security that represents the user details required for authentication and authorization. It provides methods to retrieve the username, password, authorities, and other user-related information.
import org.springframework.security.core.userdetails.CustomUserDetailsService; // UserDetailsService is used to load user-specific data during authentication.Basically,  its DB access layer for authentication.
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;// Captures additional details about the authentication request, such as the remote IP address and session ID, and includes them in the authentication token.
import org.springframework.stereotype.Component; // Component annotation is used to mark a class as a component in the Spring framework.
import org.springframework.web.filter.OncePerRequestFilter; // OncePerRequestFilter ensures that the filter is executed only once per request, preventing multiple executions in case of internal forwards or includes.
import java.io.IOException;
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthFilter(JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
protected void doFilterInternal(HttpServletRequest request,
                               HttpServletResponse response,
                               FilterChain filterChain)
        throws ServletException, IOException {

    String authHeader = request.getHeader("Authorization");

    String token = null;
    String username = null;

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        username = jwtUtil.extractUsername(token);
    }

    if (username != null &&
        SecurityContextHolder.getContext().getAuthentication() == null) {

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        if (jwtUtil.validateToken(token)) {

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }

    filterChain.doFilter(request, response);
}
}