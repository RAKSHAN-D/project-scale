# Project Scale Progress Tracker

This file tracks what is already built, what is partially built, and what still needs to be completed for Project Scale.

Current focus:

```text
Phase 1: Localhost backend testing
```

Phase 1 target:

- 1 Spring Boot Java instance
- 1 primary PostgreSQL database
- Auth layer
- Admin and Non Admin roles
- Hot data CRUD
- Cold data CRUD
- Static data CRUD or metadata CRUD
- Basic API testing before Redis, Nginx, k6, horizontal scaling, and observability

---

## Phase Status

| Phase | Goal | Status |
|---|---|---|
| Phase 1 | Localhost backend + PostgreSQL + auth + CRUD | In progress |
| Phase 2 | Redis cache for hot data and token revocation | Not started |
| Phase 3 | Nginx + two Java instances | Not started |
| Phase 4 | k6 load testing experiments | Not started |
| Phase 5 | Prometheus/Grafana observability | Not started |
| Phase 6 | Final experiment reports and comparison tables | Not started |

---

## Current Phase 1 Goal

Before doing load testing, the local backend should be able to:

1. Start successfully.
2. Connect to PostgreSQL.
3. Create or seed an admin user.
4. Login and receive a JWT token.
5. Protect APIs using Spring Security.
6. Support admin-only APIs.
7. Support normal user restrictions.
8. Perform CRUD for users.
9. Perform CRUD for hot data.
10. Perform CRUD for cold data.
11. Perform CRUD or metadata CRUD for static assets.
12. Be testable locally through Postman/curl/browser API tools.

---

## What Is Already Built

### Project Documentation

| Item | Status | Notes |
|---|---|---|
| Main README | Built | Explains target architecture and experiment plan |
| Auth flow document | Built | `Docs/Auth-Flow.md` |
| API flow document | Built | `Docs/API-FLOW.md` |
| Progress tracker | Built | This file |

### Backend Base

| Item | Status | Notes |
|---|---|---|
| Spring Boot project | Built | Located under `Backend/` |
| Maven `pom.xml` | Built | Contains Spring Boot dependencies |
| Main application class | Built | `ProjectScaleApplication.java` |
| PostgreSQL dependency | Built | `org.postgresql:postgresql` runtime dependency |
| Spring Data JPA dependency | Built | Uses Hibernate under the hood |
| Spring Security dependency | Built | Present in `pom.xml` |
| Redis dependency | Present but not used yet | Dependency exists, feature not implemented |
| Actuator dependency | Present | Useful later for Prometheus |

### Database/JPA Layer

| Item | Status | Notes |
|---|---|---|
| `User` entity | Built | Has username, email, password hash, role |
| `HotItem` entity | Built | Uses JSON-style payload |
| `ColdItem` entity | Built | Linked to user, stores type and payload |
| `StaticAsset` entity | Built | Metadata entity exists |
| `UserRepository` | Built | Basic user lookup methods exist |
| `HotItemRepository` | Built | Extends `JpaRepository` |
| `ColdItemRepository` | Built | Extends `JpaRepository`, includes `findByUser_Id` |
| `StaticAssetRepository` | Built | Basic repository exists |

### Auth Layer

| Item | Status | Notes |
|---|---|---|
| `AuthController` | Built | Has signup, login, logout endpoints |
| `AuthService` | Built | Has signup/login/logout logic; signup/login DTO naming cleaned up |
| `JwtUtil` | Built | Generates and validates JWT |
| `JwtAuthFilter` | Built | Reads bearer token and sets security context |
| `CustomUserDetailsService` | Built | Loads user for Spring Security |
| `UserPrincipal` | Built | Exposes logged-in user id and authorities |
| `AuthSecurityConfig` | Built | Configures stateless JWT security |
| `MethodSecurityConfig` | Built | Enables `@PreAuthorize` |
| `SeedAdmin` | Built | Creates admin for local testing when missing |

### User Module

| Item | Status | Notes |
|---|---|---|
| `UserController` | Built | Exposes `/api/users` endpoints |
| `UserService` | Built | CRUD logic exists with default role assignment |
| `CreateUserRequest` | Built | Request DTO exists with validation |
| `UpdateUserRequest` | Built | Request DTO exists with optional-field validation |
| `UserResponse` | Built | Response DTO exists |
| `SignupResponse` | Built | Signup-specific response DTO exists |
| `LoginResponse` | Built | Login token response DTO exists |

### Hot Data Module

| Item | Status | Notes |
|---|---|---|
| `HotItemController` | Built | Exposes `/api/hot-data` |
| `HotItemService` | Built | CRUD logic exists with admin/self-user authorization |
| `HotItemRepository` | Built | DB access exists, includes user-owned lookup |
| `HotItemRequest` | Built | Request DTO exists with `userId`, `itemKey`, and `value` |
| `HotItemResponse` | Built | Response DTO includes owner `userId` |
| Redis caching | Not started | Planned for later phase |

### Cold Data Module

| Item | Status | Notes |
|---|---|---|
| `ColdItemController` | Built | Exposes `/api/cold-data` |
| `ColdItemService` | Built partially | CRUD logic exists |
| `ColdItemRepository` | Built | DB access exists |
| `ColdItemRequest` | Built | Request DTO exists |
| `ColdItemResponse` | Built | Response DTO exists, can be improved later |

### Static Data Module

| Item | Status | Notes |
|---|---|---|
| `StaticAsset` entity | Built | Metadata model exists |
| `StaticAssetRepository` | Built | DB access exists |
| `StaticAssetController` | Not started | Needed for Phase 1 |
| `StaticAssetService` | Not started | Needed for Phase 1 |
| Static asset DTOs | Not started | Needed for Phase 1 |
| Actual file serving | Not started | Later Nginx/static-file phase |

---

## Current Roles

Current enum:

```java
public enum UserRole {
    ADMIN,
    FIRST_CLASS,
    SECOND_CLASS
}
```

Current understanding for Phase 1:

| Role | Phase 1 Meaning | Status |
|---|---|---|
| `ADMIN` | Admin user | Keep |
| `SECOND_CLASS` | Normal non-admin user | Keep as normal user for now |
| `FIRST_CLASS` | Not clearly defined | Decide later |

Phase 1 recommendation:

```text
Use ADMIN and SECOND_CLASS only until the project needs more role levels.
```

---

## Known Blockers Before Running Locally

These need to be fixed before the backend can be trusted for Phase 1 testing.

| Area | Issue | Status |
|---|---|---|
| Auth service | Uses `user.setPassword(...)`, but `User` has `setPasswordHash(...)` | Fixed |
| User principal | Uses `user.getPassword()`, but `User` has `getPasswordHash()` | Fixed |
| Package naming | `CustomUserDetailsService` uses uppercase `Auth` package | Fixed |
| Import naming | `AuthService` imports uppercase `Auth.JwtUtil` | Fixed |
| Security config | File name `AuthSecurityConfig.java` does not match public class `SecurityConfig` | Fixed |
| Admin seed | Uses `existsByemail`, but repository has `existsByEmail` | Fixed |
| Admin seed | Uses `User.Role.ADMIN`, but enum is `UserRole.ADMIN` | Fixed |
| JWT config | `jwt.secret` and `jwt.expiration` missing from YAML | Fixed |
| Maven | Maven wrapper failed to start; global `mvn` not installed | Fixed |
| DB schema | `ddl-auto: validate` requires existing matching tables | Partially verified |
| DB enum mapping | `users.role` is PostgreSQL enum `user_role`, while Java enum was inserted as varchar | Fixed |
| Hot data schema | `HotItem` now requires `hot_items.user_id` for ownership | Pending DB schema update |
| SQL migration files | Baseline table and index SQL files exist under `Backend/src/main/resources/db/migration` | Created, not wired to Flyway yet |

---

## Phase 1 Completion Checklist

### Step 1: Make Backend Compile

- [x] Fix password field method mismatches.
- [x] Fix auth package casing.
- [x] Fix auth imports.
- [x] Fix security config class/file name mismatch.
- [x] Fix `SeedAdmin`.
- [x] Add missing JWT config values.
- [x] Confirm Maven wrapper or local Maven works.
- [x] Run compile/test successfully.

### Step 2: Stabilize Auth

- [x] Confirm admin user is created or can be created.
- [ ] Confirm `/auth/login` works.
- [ ] Confirm JWT token is returned.
- [ ] Confirm protected APIs reject requests without token.
- [ ] Confirm protected APIs accept valid token.
- [ ] Confirm admin-only APIs require `ADMIN`.
- [ ] Confirm normal user cannot call admin-only APIs.

### Step 3: User CRUD

- [ ] Create user as admin.
- [ ] Get user by id.
- [ ] Get all users as admin.
- [ ] Update user.
- [ ] Delete user.
- [ ] Verify normal user restrictions.

### Step 4: Hot Data CRUD

- [x] Add user ownership to hot items in Java code.
- [ ] Add `user_id` column and FK to `hot_items` table.
- [ ] Create hot item.
- [ ] Get hot item by id.
- [ ] Get all hot items.
- [ ] Get hot items for a user.
- [ ] Update hot item.
- [ ] Delete hot item.
- [ ] Verify admin/self-user restrictions.

### Step 5: Cold Data CRUD

- [ ] Create cold item.
- [ ] Get cold items for user.
- [ ] Get cold item by id.
- [ ] Get all cold items as admin.
- [ ] Update cold item.
- [ ] Delete cold item.
- [ ] Verify role restrictions.

### Step 6: Static Asset Metadata CRUD

- [ ] Create `StaticAssetRequest` DTO.
- [ ] Create `StaticAssetResponse` DTO.
- [ ] Create `StaticAssetService`.
- [ ] Create `StaticAssetController`.
- [ ] Create static asset metadata.
- [ ] Get static asset metadata by id.
- [ ] Get all static asset metadata.
- [ ] Update static asset metadata.
- [ ] Delete static asset metadata.

### Step 7: Localhost API Testing

- [ ] Start PostgreSQL locally.
- [ ] Confirm database exists.
- [ ] Confirm schema matches entities.
- [ ] Start Spring Boot app.
- [ ] Test auth APIs.
- [ ] Test user APIs.
- [ ] Test hot data APIs.
- [ ] Test cold data APIs.
- [ ] Test static asset APIs.
- [ ] Record working curl/Postman examples.

---

## Later Phases

### Phase 2: Redis

- [ ] Add Redis config.
- [ ] Cache hot item reads.
- [ ] Invalidate cache on hot item writes.
- [ ] Add JWT revocation/token store if needed.
- [ ] Track cache hit/miss behavior.

### Phase 3: Nginx And Multiple Instances

- [ ] Add Dockerfile.
- [ ] Add Docker Compose.
- [ ] Run app instance 1.
- [ ] Run app instance 2.
- [ ] Add Nginx reverse proxy.
- [ ] Add round-robin routing.
- [ ] Serve static files through Nginx.

### Phase 4: k6 Load Testing

- [ ] Write baseline test.
- [ ] Write cache-on test.
- [ ] Write two-instance test.
- [ ] Write hot-vs-cold mix test.
- [ ] Write static file test.

### Phase 5: Observability

- [ ] Enable actuator Prometheus endpoint.
- [ ] Add Prometheus config.
- [ ] Add Grafana dashboard.
- [ ] Track p50, p95, p99 latency.
- [ ] Track error rate.
- [ ] Track HikariCP pool usage.
- [ ] Track cache metrics.

### Phase 6: Final Results

- [ ] Document baseline breaking point.
- [ ] Document Redis improvement.
- [ ] Document horizontal scaling gain.
- [ ] Document hot vs cold latency difference.
- [ ] Document static serving comparison.
- [ ] Create final comparison table.

---

## Update Log

| Date | Update |
|---|---|
| 2026-10-07 | Created progress tracker from current project review |
| 2026-10-08 | Fixed first auth-layer blockers for login and JWT request validation |
| 2026-10-08 | Added `SignupResponse` for signup and `LoginResponse` for login token responses |
| 2026-10-08 | Fixed Maven wrapper startup and PostgreSQL enum mapping for `UserRole` |
| 2026-10-08 | Verified `./mvnw.cmd test` passes successfully |
| 2026-10-09 | Cleaned up user module DTO validation, default role assignment, and update authorization |
| 2026-10-09 | Added HotItem user ownership and admin/self-user API flow; DB schema still needs `hot_items.user_id` |
| 2026-10-11 | Added baseline SQL migration files for Project Scale tables and indexes |
