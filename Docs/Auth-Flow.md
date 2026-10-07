# Auth Flow

This document explains the authentication flow for Project Scale in simple terms.

The project uses Spring Boot, Spring Security, JWT tokens, and role-based access control. The main idea is:

1. A user logs in with username and password.
2. Spring Security verifies the credentials.
3. If the credentials are correct, the backend creates a JWT token.
4. The client sends that token in future requests.
5. A JWT filter checks the token before protected APIs run.
6. Spring Security stores the authenticated user for that request.
7. Controllers and services use roles like `ADMIN` to allow or block access.

---

## Simple Auth Flow

In the simplest form, the flow looks like this:

```text
Login request
    -> AuthController
    -> AuthService
    -> AuthenticationManager
    -> CustomUserDetailsService
    -> UserRepository
    -> PostgreSQL users table
    -> password check
    -> JWT generated
    -> token returned to client
```

After login, the client calls protected APIs like this:

```text
GET /api/users
Authorization: Bearer <jwt-token>
```

Then the request flow becomes:

```text
Request
    -> JwtAuthFilter
    -> JwtUtil validates token
    -> CustomUserDetailsService loads user
    -> SecurityContextHolder stores authenticated user
    -> Controller
    -> Service
    -> @PreAuthorize role check
    -> Repository
    -> PostgreSQL
```

---

## Why JWT Is Used

JWT means JSON Web Token.

Instead of storing login session data inside the Java server, the server gives the client a signed token. The token contains basic identity information like:

- username
- user id
- role
- expiry time

Because the token is signed, the backend can later verify that the token was created by this application and was not changed by the client.

For Phase 1 localhost testing, JWT can work as a simple stateless login mechanism.

Later, Redis can be added for token revocation/logout across multiple app instances.

---

## Roles In This Project

Current file:

`Backend/src/main/java/com/projectscale/projectscale/entity/UserRole.java`

Current roles:

```java
public enum UserRole {
    ADMIN,
    FIRST_CLASS,
    SECOND_CLASS
}
```

For the first phase, the project can be understood as:

| Role | Meaning |
|---|---|
| `ADMIN` | Can manage users and protected datasets |
| `SECOND_CLASS` | Normal non-admin user |
| `FIRST_CLASS` | Exists in code, but its purpose is not clearly defined yet |

So for now, the practical auth model is:

```text
ADMIN vs normal user
```

---

## File-by-File Auth Flow

### 1. `User.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/entity/User.java`

This is the database entity for application users.

It stores:

- `id`
- `username`
- `email`
- `passwordHash`
- `role`
- `createdAt`

Important point:

The password should never be stored as plain text. It should be stored as a BCrypt hash in `passwordHash`.

---

### 2. `UserRole.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/entity/UserRole.java`

This enum defines the roles available in the system.

Spring Security checks roles using expressions like:

```java
@PreAuthorize("hasRole('ADMIN')")
```

Spring internally expects the authority name to be:

```text
ROLE_ADMIN
```

That is why the project adds `"ROLE_"` before the enum role name when building authorities.

---

### 3. `UserRepository.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/repository/UserRepository.java`

This is the database access layer for users.

It provides methods such as:

```java
Optional<User> findByUsername(String username);
Optional<User> findByEmail(String email);
boolean existsByUsername(String username);
boolean existsByEmail(String email);
```

Auth uses this repository to:

- check if a signup username/email already exists
- load a user during login
- load a user while validating JWT requests

---

### 4. `SignupRequest.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/dto/SignupRequest.java`

This DTO receives signup input from the client.

It contains:

- `username`
- `email`
- `password`

It also has validation annotations like:

```java
@NotBlank
@Email
@Size(min = 8)
```

These validations run before the service logic when the controller uses `@Valid`.

---

### 5. `LoginRequest.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/dto/LoginRequest.java`

This DTO receives login input:

- `username`
- `password`

The password here is the raw password entered by the user. It is checked against the stored BCrypt hash by Spring Security.

---

### 6. `AuthController.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/controller/AuthController.java`

This controller exposes auth endpoints.

Current base path:

```java
@RequestMapping("/auth")
```

Current endpoints:

```text
POST /auth/signup
POST /auth/login
POST /auth/logout
```

Flow:

```text
Client request
    -> AuthController
    -> AuthService
```

The controller should stay thin. Its job is only to receive the request and call the service.

---

### 7. `AuthService.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/services/AuthService.java`

This service contains the main auth business logic.

Signup flow:

```text
Check duplicate username
Check duplicate email
Encode password using PasswordEncoder
Set default role
Save user
Return user response
```

Login flow:

```text
Receive username/password
Ask AuthenticationManager to authenticate
Load user from DB
Generate JWT token
Return token
```

Logout flow currently:

```text
Return success message
```

For the future Redis phase, logout should delete or blacklist the token in Redis.

---

### 8. `ProjectScaleApplication.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/ProjectScaleApplication.java`

This is the main Spring Boot entry point.

It also defines the password encoder bean:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

This bean is used when:

- creating users
- signing up users
- checking login passwords through Spring Security

---

### 9. `CustomUserDetailsService.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/auth/CustomUserDetailsService.java`

This class connects Spring Security to the project user table.

Spring Security does not automatically know how users are stored in this project. So this class tells Spring:

```text
Given a username, load the user from PostgreSQL.
```

Flow:

```text
AuthenticationManager
    -> CustomUserDetailsService.loadUserByUsername(username)
    -> UserRepository.findByUsername(username)
    -> return UserDetails object
```

The returned `UserDetails` contains:

- username
- password hash
- authorities such as `ROLE_ADMIN`

Spring Security then compares the raw login password with the stored password hash.

---

### 10. `UserPrincipal.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/auth/UserPrincipal.java`

This class is intended to represent the logged-in user inside Spring Security.

Its useful purpose is that it can expose:

```java
authentication.principal.id
```

That allows method security rules like:

```java
@PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
```

Meaning:

```text
Allow admins, or allow the user if they are accessing their own data.
```

This is important for user-specific APIs.

---

### 11. `JwtUtil.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/auth/JwtUtil.java`

This class creates and validates JWT tokens.

Token generation:

```text
User logs in
    -> JwtUtil.generateToken(user)
    -> token contains username, userId, role, expiry
```

Token validation:

```text
Request contains Bearer token
    -> JwtUtil validates signature and expiry
    -> username is extracted from token
```

Important config values used by this class:

```yaml
jwt:
  secret: some-long-secret-key
  expiration: 3600000
```

`expiration` is normally in milliseconds.

---

### 12. `JwtAuthFilter.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/auth/JwtAuthFilter.java`

This is the most important file for protected requests.

It runs once per request before the controller.

Flow:

```text
Read Authorization header
Check if it starts with "Bearer "
Extract token
Extract username from token
Load user from DB
Validate token
Create Authentication object
Store it in SecurityContextHolder
Continue request
```

After this filter succeeds, Spring considers the request authenticated.

Then protected controllers/services can run.

---

### 13. `AuthSecurityConfig.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/config/AuthSecurityConfig.java`

This file defines the main Spring Security rules.

Current behavior:

```java
.requestMatchers("/auth/**").permitAll()
.anyRequest().authenticated()
```

Meaning:

| Route | Access |
|---|---|
| `/auth/**` | Public |
| Everything else | Requires JWT login |

It also sets:

```java
SessionCreationPolicy.STATELESS
```

That means the backend does not create server-side login sessions. Every protected request must carry its JWT token.

It also adds:

```java
.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
```

This tells Spring Security:

```text
Run JwtAuthFilter before the normal username/password filter.
```

---

### 14. `MethodSecurityConfig.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/config/MethodSecurityConfig.java`

This enables method-level security:

```java
@EnableMethodSecurity
```

Because of this, annotations like the following work:

```java
@PreAuthorize("hasRole('ADMIN')")
```

Without this config, those annotations may not be enforced.

---

### 15. `SeedAdmin.java`

Path:

`Backend/src/main/java/com/projectscale/projectscale/config/SeedAdmin.java`

This file is intended to create a default admin user when the app starts.

Purpose:

```text
When the app starts:
    -> check if admin email exists
    -> if not, create admin user
    -> assign ADMIN role
```

This helps local testing because you need one admin account before admin-only APIs can be tested.

Example local admin idea:

```text
username: admin
email: admin@gmail.com
password: admin123
role: ADMIN
```

For real projects, default credentials should not be hardcoded.

---

## How Protected APIs Use Auth

Example from user APIs:

```java
@PreAuthorize("hasRole('ADMIN')")
```

This means:

```text
Only users with ROLE_ADMIN can call this method.
```

Example:

```java
@PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
```

This means:

```text
Allow admin users.
Also allow normal users if the requested id is their own user id.
```

This is how the project separates admin behavior from normal user behavior.

---

## Phase 1 Auth Goal

For first-phase localhost testing, the auth system should support:

1. Start Spring Boot locally.
2. Connect to local PostgreSQL.
3. Seed or create one admin user.
4. Login as admin.
5. Receive JWT token.
6. Use token to call admin-only APIs.
7. Create normal user.
8. Login as normal user.
9. Confirm normal user cannot call admin-only APIs.
10. Confirm normal user can call only allowed user-specific APIs.

This is enough before adding Redis, Nginx, load balancing, and k6 tests.

---

## Current Code Notes To Fix Later

These notes describe current code mismatches found during project review.

They should be fixed before Phase 1 auth testing:

- `AuthService.java` imports `com.projectscale.projectscale.Auth.JwtUtil`, but the actual package should be lowercase `auth`.
- `CustomUserDetailsService.java` declares package `com.projectscale.projectscale.Auth`, but the folder/package convention is lowercase `auth`.
- `User.java` has `passwordHash`, `getPasswordHash()`, and `setPasswordHash()`, but some auth files call `getPassword()` or `setPassword()`.
- `SeedAdmin.java` calls `existsByemail`, but `UserRepository` defines `existsByEmail`.
- `SeedAdmin.java` uses `User.Role.ADMIN`, but the project role enum is `UserRole.ADMIN`.
- `AuthSecurityConfig.java` file name and public class name should match.
- `jwt.secret` and `jwt.expiration` need to be configured in application properties/YAML.

Once these are fixed, the auth flow can be tested properly on localhost.
