# Auth Flow

This document explains the authentication flow for Project Scale in simple terms.

There are three auth-related flows in this project:

```text
1. Signup / account creation
2. Login / JWT generation
3. Protected request / JWT validation
```

Important mental model:

```text
Signup creates a user.
Login verifies username/password and creates a JWT.
JwtAuthFilter validates the JWT on every protected request.
```

---

## Main Auth Files

| File | Responsibility |
|---|---|
| `AuthController.java` | Exposes `/auth/signup`, `/auth/login`, `/auth/logout` |
| `AuthService.java` | Contains signup, login, and logout logic |
| `SignupRequest.java` | Request body for signup |
| `SignupResponse.java` | Response body for signup |
| `LoginRequest.java` | Request body for login |
| `LoginResponse.java` | Response body for login token |
| `User.java` | JPA entity mapped to `users` table |
| `UserRole.java` | Defines roles such as `ADMIN` and `SECOND_CLASS` |
| `UserRepository.java` | Reads/writes users from PostgreSQL |
| `CustomUserDetailsService.java` | Loads user details from DB for Spring Security |
| `UserPrincipal.java` | Represents the logged-in user inside Spring Security |
| `JwtUtil.java` | Generates and validates JWT tokens |
| `JwtAuthFilter.java` | Reads JWT from requests and authenticates the request |
| `AuthSecurityConfig.java` | Defines Spring Security filter chain and route rules |
| `MethodSecurityConfig.java` | Enables `@PreAuthorize` |
| `SeedAdmin.java` | Creates a default admin user for local testing |

---

## Important Concepts

### `AuthenticationManager`

`AuthenticationManager` is a Spring Security component.

Its job is to verify login credentials:

```text
username + raw password
    -> load user from DB
    -> compare raw password with stored password hash
    -> pass or fail authentication
```

It does not directly know your `users` table. To load users, it calls `CustomUserDetailsService`.

### `CustomUserDetailsService`

`CustomUserDetailsService` does not store user details.

Its job is to load user details from the database whenever Spring Security asks for a user.

It does this:

```text
loadUserByUsername(username)
    -> UserRepository.findByUsername(username)
    -> create UserPrincipal
    -> return UserPrincipal to Spring Security
```

This file is used in both:

- login flow
- JWT validation flow

### `UserPrincipal`

`UserPrincipal` is the Spring Security version of your `User`.

It exposes:

- user id
- username
- password hash
- authorities/roles

This matters because some authorization checks need the logged-in user's id:

```java
@PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
```

### `JwtUtil`

`JwtUtil` has two main jobs:

```text
1. generateToken(user)
2. validateToken(token)
```

It also extracts the username from the token:

```text
extractUsername(token)
```

### `JwtAuthFilter`

`JwtAuthFilter` runs before controllers on protected requests.

It reads:

```http
Authorization: Bearer <jwt-token>
```

Then it validates the token and stores the authenticated user in Spring Security for that request.

---

## Flow 1: Signup / Account Creation

Purpose:

```text
Create a user account in the database.
```

This flow is related to auth, but it is not the same as login. It creates the identity record that login will later use.

Endpoint:

```text
POST /auth/signup
```

Request DTO:

`SignupRequest.java`

Request body:

```json
{
  "username": "rakshan",
  "email": "rakshan@gmail.com",
  "password": "password123"
}
```

Response DTO:

`SignupResponse.java`

Response body:

```json
{
  "id": 1,
  "username": "rakshan",
  "email": "rakshan@gmail.com",
  "role": "SECOND_CLASS"
}
```

The password is not returned. The backend receives the raw password once, hashes it, and stores only the hash.

### Signup Sequence

```text
POST /auth/signup
    -> AuthController.signup()
    -> AuthService.signup()
    -> UserRepository.existsByUsername()
    -> UserRepository.existsByEmail()
    -> PasswordEncoder.encode()
    -> create User entity
    -> UserRepository.save()
    -> PostgreSQL users table
    -> toSignupResponse()
    -> SignupResponse returned
```

### Important Functions

`AuthController.signup()`

```java
public ResponseEntity<SignupResponse> signup(
        @Valid @RequestBody SignupRequest request)
```

This receives the HTTP request and passes the DTO to the service.

`AuthService.signup()`

```java
public SignupResponse signup(SignupRequest request)
```

This performs the signup logic:

- check duplicate username
- check duplicate email
- hash password
- set default role
- save user
- return signup response

`PasswordEncoder.encode()`

```java
passwordEncoder.encode(request.getPassword())
```

This converts the raw password into a BCrypt hash.

`UserRepository.save()`

```java
userRepository.save(user)
```

This saves the user into PostgreSQL through Spring Data JPA and Hibernate.

`toSignupResponse()`

```java
private SignupResponse toSignupResponse(User user)
```

This decides what leaves the backend. It intentionally excludes the password hash.

---

## Flow 2: Login / JWT Generation

Purpose:

```text
Verify username/password and create a JWT token.
```

Endpoint:

```text
POST /auth/login
```

Request DTO:

`LoginRequest.java`

Request body:

```json
{
  "username": "rakshan",
  "password": "password123"
}
```

Response DTO:

`LoginResponse.java`

Response body:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer"
}
```

### Login Sequence

```text
POST /auth/login
    -> AuthController.login()
    -> AuthService.login()
    -> AuthenticationManager.authenticate()
    -> CustomUserDetailsService.loadUserByUsername()
    -> UserRepository.findByUsername()
    -> UserPrincipal returned
    -> Spring Security compares raw password with password hash
    -> AuthService loads User
    -> JwtUtil.generateToken(user)
    -> LoginResponse returned
```

### Important Functions

`AuthController.login()`

```java
public ResponseEntity<LoginResponse> login(
        @Valid @RequestBody LoginRequest request)
```

This receives the login request and calls the service.

`AuthService.login()`

```java
public LoginResponse login(LoginRequest request)
```

This starts authentication and returns a JWT token if authentication succeeds.

`AuthenticationManager.authenticate()`

```java
authManager.authenticate(
    new UsernamePasswordAuthenticationToken(
        request.getUsername(),
        request.getPassword()
    )
);
```

This is the Spring Security login check.

It verifies:

```text
Does this username exist?
Does this raw password match the stored password hash?
```

To answer that, it uses `CustomUserDetailsService`.

`CustomUserDetailsService.loadUserByUsername()`

```java
public UserDetails loadUserByUsername(String username)
```

This loads the user from DB:

```java
userRepository.findByUsername(username)
```

Then returns:

```java
new UserPrincipal(user)
```

`UserPrincipal`

`UserPrincipal` gives Spring Security:

- username
- password hash
- role/authority
- user id

Spring Security then compares:

```text
raw password from LoginRequest
vs
passwordHash from UserPrincipal
```

`JwtUtil.generateToken()`

```java
jwtUtil.generateToken(user)
```

This creates the JWT after login succeeds.

The token contains claims like:

- username
- user id
- role
- expiry time

---

## Flow 3: Protected Request / JWT Validation

Purpose:

```text
Validate JWT on every protected request.
```

Example request:

```http
GET /api/cold-data/user/1
Authorization: Bearer <jwt-token>
```

### Protected Request Sequence

```text
Client sends request with Authorization header
    -> Spring Security filter chain starts
    -> JwtAuthFilter.doFilterInternal()
    -> read Authorization header
    -> extract Bearer token
    -> JwtUtil.extractUsername(token)
    -> CustomUserDetailsService.loadUserByUsername(username)
    -> JwtUtil.validateToken(token)
    -> create UsernamePasswordAuthenticationToken
    -> SecurityContextHolder stores authentication
    -> request continues to Controller
    -> Controller calls Service
    -> @PreAuthorize checks role/ownership
    -> Repository
    -> PostgreSQL
```

### Important Functions

`JwtAuthFilter.doFilterInternal()`

This method runs once per request.

It reads:

```java
request.getHeader("Authorization")
```

It expects this format:

```text
Bearer <jwt-token>
```

Then it extracts the token:

```java
token = authHeader.substring(7);
```

`JwtUtil.extractUsername()`

```java
username = jwtUtil.extractUsername(token);
```

This reads the subject/username from the JWT.

`CustomUserDetailsService.loadUserByUsername()`

```java
UserDetails userDetails =
        customUserDetailsService.loadUserByUsername(username);
```

This loads fresh user details from PostgreSQL.

This is useful because roles or user status may come from the DB, not only from the token.

`JwtUtil.validateToken()`

```java
jwtUtil.validateToken(token)
```

This checks:

- token signature
- token expiry
- token structure

If invalid, the request remains unauthenticated.

`UsernamePasswordAuthenticationToken`

```java
new UsernamePasswordAuthenticationToken(
    userDetails,
    null,
    userDetails.getAuthorities()
)
```

This creates the Spring Security authentication object for the current request.

`SecurityContextHolder`

```java
SecurityContextHolder.getContext().setAuthentication(authToken);
```

This stores the authenticated user for the current request.

After this line, Spring Security knows:

```text
Who is the user?
What role do they have?
Are they authenticated?
```

Then controller/service methods can use:

```java
@PreAuthorize("hasRole('ADMIN')")
```

or:

```java
@PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
```

---

## Spring Security Config

File:

`Backend/src/main/java/com/projectscale/projectscale/config/AuthSecurityConfig.java`

Main rules:

```java
.requestMatchers("/auth/**").permitAll()
.anyRequest().authenticated()
```

Meaning:

| Route | Access |
|---|---|
| `/auth/**` | Public |
| Everything else | Requires valid JWT |

The config is stateless:

```java
SessionCreationPolicy.STATELESS
```

Meaning:

```text
No server-side login session.
Every protected request must send the JWT again.
```

The JWT filter is added before Spring's username/password filter:

```java
.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
```

Meaning:

```text
Before request reaches controller, check if it has a valid JWT.
```

---

## Method Security

File:

`Backend/src/main/java/com/projectscale/projectscale/config/MethodSecurityConfig.java`

This enables:

```java
@PreAuthorize
```

Example:

```java
@PreAuthorize("hasRole('ADMIN')")
```

Meaning:

```text
Only users with ROLE_ADMIN can call this method.
```

Example:

```java
@PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
```

Meaning:

```text
Allow admins.
Also allow the user if they are accessing their own data.
```

---

## Roles In This Project

File:

`Backend/src/main/java/com/projectscale/projectscale/entity/UserRole.java`

Current roles:

```java
public enum UserRole {
    ADMIN,
    FIRST_CLASS,
    SECOND_CLASS
}
```

For Phase 1:

| Role | Meaning |
|---|---|
| `ADMIN` | Admin user |
| `SECOND_CLASS` | Normal non-admin user |
| `FIRST_CLASS` | Exists, but not clearly used yet |

Practical Phase 1 model:

```text
ADMIN vs normal user
```

---

## JWT Config

File:

`Backend/src/main/resources/application.yaml`

Current JWT values:

```yaml
jwt:
  secret: ${JWT_SECRET:project-scale-local-jwt-secret-key-change-before-production}
  expiration: ${JWT_EXPIRATION:3600000}
```

`expiration` is in milliseconds.

For local testing:

```text
3600000 ms = 1 hour
```

---

## Phase 1 Auth Goal

For first-phase localhost testing, auth should support:

1. Start Spring Boot locally.
2. Connect to PostgreSQL.
3. Seed or create one admin user.
4. Login as admin.
5. Receive `LoginResponse` with JWT token.
6. Use token to call admin-only APIs.
7. Create normal user.
8. Login as normal user.
9. Confirm normal user cannot call admin-only APIs.
10. Confirm normal user can call only allowed user-specific APIs.

---

## Memory Shortcut

```text
Signup creates user.
Login checks username/password.
AuthenticationManager performs the login check.
CustomUserDetailsService loads user from DB.
JwtUtil creates and validates token.
JwtAuthFilter checks token on every protected request.
SecurityContextHolder stores logged-in user for one request.
@PreAuthorize checks role/ownership.
```
