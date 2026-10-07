# Project Scale

A high-traffic backend simulation system built to observe, break, and optimize a CRUD application under real concurrent load.

The goal isn't just to build a working backend — it's to understand **how systems degrade**, where bottlenecks appear, and what actually happens when you add caching and horizontal scaling. Every architectural decision here is made with load behavior in mind.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot, Spring Security, Spring Data JPA |
| Database | PostgreSQL + HikariCP |
| Cache | Redis (hot data + JWT session store) |
| Load Balancer | Nginx (round-robin + static file server) |
| Load Testing | k6 |
| Observability | Prometheus + Grafana + Micrometer |
| Auth | JWT (stateless, Redis-backed for revocation) |

---

## Architecture Overview

```
Client (k6 / Browser)
        │
        ▼
    Nginx :80
    ├── /static/*  → serves files directly from disk (no app thread)
    └── /api/*     → round-robin to...
            ├── Spring Boot :8080
            └── Spring Boot :8081
                    │
                    ├── Redis   (hot cache + JWT store)
                    └── PostgreSQL  (primary store)
```

Two Spring Boot instances run behind Nginx. Both share the same PostgreSQL and Redis — stateless application tier. JWT is validated cryptographically and stored in Redis to enable instant revocation across instances.

---

## Data Model

| Category | Access Pattern | Storage | Cache Strategy |
|---|---|---|---|
| Hot Items | Frequent reads | PostgreSQL | Redis, 60s TTL, cache-aside |
| Cold Items | Rare reads | PostgreSQL | None — direct DB reads |
| Static Assets | High volume | Disk | Nginx serves directly |

Cache-aside pattern for hot data: check Redis → on miss, query Postgres → write to Redis → serve. On write, invalidate the key immediately.

Thundering herd protection via Redis distributed lock (`SET NX PX`) — prevents simultaneous cache misses from dogpiling Postgres.

---

## Project Structure

```
project-scale/
├── backend/              # Spring Boot application
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/             # Plain HTML/CSS/JS (served by Nginx)
│   ├── index.html
│   └── panel.html
├── infra/
│   ├── nginx/
│   │   └── nginx.conf
│   ├── k6/
│   │   └── scripts/      # One script per experiment
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── dashboards/
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Backend `src/main` Overview

The main backend code currently lives under:

`Backend/src/main/java/com/projectscale/projectscale`

That folder is split into these layers:

| Folder | Responsibility |
|---|---|
| `auth/` | JWT creation/validation, auth filter, user details loading for Spring Security |
| `config/` | Security configuration, method-level auth enablement, startup seed logic |
| `controller/` | HTTP endpoints; receives requests and returns responses |
| `dto/` | Request and response models used at the API boundary |
| `entity/` | JPA entities mapped to PostgreSQL tables |
| `repository/` | Spring Data JPA access layer for reading/writing entities |
| `services/` | Business logic between controllers and repositories |
| `resources/` | Runtime configuration such as datasource settings and active profile values |

The application entrypoint is:

- `Backend/src/main/java/com/projectscale/projectscale/ProjectScaleApplication.java`

That class boots Spring Boot and registers the password encoder bean used by auth and user creation flows.

---

## How API Flow Works

The current request flow is:

1. Client sends an HTTP request to a controller endpoint.
2. If the route is protected, Spring Security checks the `Authorization: Bearer <token>` header.
3. `JwtAuthFilter` extracts the token, `JwtUtil` validates it, and `CustomUserDetailsService` loads the user identity.
4. Spring stores the authenticated user in the security context.
5. The controller receives the request body as a DTO.
6. The controller calls the corresponding service method.
7. The service applies business rules and validation, then calls a repository.
8. The repository uses JPA/Hibernate to read or write PostgreSQL entities.
9. The service converts entities into response DTOs.
10. The controller returns the final HTTP response.

In short:

`Request -> Security Filter -> Controller -> Service -> Repository -> PostgreSQL -> Service -> Response`

---

## Layer-by-Layer Explanation

### `auth/`

This package handles token-based authentication.

- `JwtUtil` creates JWTs during login and validates them on incoming requests.
- `JwtAuthFilter` runs once per request and populates the Spring Security context when a valid token is present.
- `CustomUserDetailsService` loads user data from the database for authentication.
- `UserPrincipal` is intended to represent the authenticated user inside Spring Security.

What this means in practice:

- Login generates a JWT.
- Protected routes expect that token in the `Authorization` header.
- Method-level rules such as `@PreAuthorize("hasRole('ADMIN')")` depend on this auth layer being populated correctly.

### `config/`

This package wires security and startup behavior.

- `AuthSecurityConfig.java` defines the main security filter chain.
- `/auth/**` is currently public.
- Everything else currently requires authentication.
- `MethodSecurityConfig` enables `@PreAuthorize` checks on service/controller methods.
- `SeedAdmin` tries to create a default admin user when the app starts.

This layer is the bridge between raw Spring Boot defaults and your project-specific auth rules.

### `controller/`

Controllers define the public API surface.

Current controllers:

- `AuthController` -> `/auth/signup`, `/auth/login`, `/auth/logout`
- `UserController` -> `/api/users`
- `HotItemController` -> `/api/hot-data`
- `ColdItemController` -> `/api/cold-data`

Each controller should stay thin:

- Accept request
- Delegate to service
- Return DTO/HTTP status

The controllers in this repo mostly follow that pattern.

### `dto/`

DTOs are the contract between clients and the backend.

Request DTOs:

- `LoginRequest`
- `SignupRequest`
- `CreateUserRequest`
- `UpdateUserRequest`
- `HotItemRequest`
- `ColdItemRequest`

Response DTOs:

- `AuthResponse`
- `UserResponse`
- `HotItemResponse`
- `ColdItemResponse`

Why this layer matters:

- It prevents exposing JPA entities directly over the API.
- It gives you a clean place for validation annotations and response shaping.

### `entity/`

Entities define the database model.

Current domain entities:

- `User`
- `HotItem`
- `ColdItem`
- `StaticAsset`

Enums:

- `UserRole`
- `ColdItemType`

How they map conceptually:

- `User` stores identity, email, password hash, role, and created timestamp.
- `HotItem` stores frequently read data with a JSON payload and update timestamp.
- `ColdItem` stores user-linked data with a type and payload.
- `StaticAsset` stores metadata for uploaded/static files.

This is the layer Hibernate uses to translate Java objects into PostgreSQL rows.

### `repository/`

Repositories are the DB access boundary.

Current repositories:

- `UserRepository`
- `HotItemRepository`
- `ColdItemRepository`
- `StaticAssetRepository`

They provide:

- Standard CRUD via `JpaRepository`
- Simple finder methods like `findByUsername`, `existsByItemKey`, and `findByUser_Id`

This keeps SQL-like access out of controllers and mostly out of services.

### `services/`

Services contain the application logic.

Current services:

- `AuthService`
- `UserService`
- `HotItemService`
- `ColdItemService`

Typical service responsibilities in this project:

- Validate business rules
- Check uniqueness
- Load related entities
- Enforce authorization with `@PreAuthorize`
- Save via repositories
- Convert entities to response DTOs

This is the layer where most future caching, performance logic, and experiment-specific behavior will belong.

### `resources/`

This folder holds runtime config.

Current files:

- `application.yaml`
- `application-local.yaml`

What they currently define:

- Spring app name
- Active profile
- PostgreSQL connection
- Hikari pool settings
- JPA mode (`ddl-auto: validate`)
- Local datasource password override

---

## Current Auth Flow

The implemented auth flow is currently:

1. `POST /auth/signup`
   Creates a user record with encoded password and default role.
2. `POST /auth/login`
   Authenticates username/password through Spring Security.
3. `AuthService` calls `JwtUtil.generateToken(user)`.
4. Client sends that token on later requests as `Bearer <jwt>`.
5. `JwtAuthFilter` validates the token and sets the authenticated user in Spring Security.
6. Protected endpoints are then allowed or denied based on `@PreAuthorize`.

Important implementation note:

- The documentation goal says JWT revocation should be Redis-backed, but the current checked-in code is still mostly plain JWT validation plus security context setup.
- `logout()` currently only returns a success message; it does not yet revoke a token in Redis.

---

## Current CRUD Flow By Module

### Users

- `UserController` receives the request.
- `UserService` validates fields, checks duplicate username/email, encodes password, and saves through `UserRepository`.
- Response is returned as `UserResponse`.

### Hot Data

- `HotItemController` handles `/api/hot-data`.
- `HotItemService` validates uniqueness of `itemKey`, saves the JSON payload through `HotItemRepository`, and maps the result to `HotItemResponse`.
- This module looks intended to become the Redis-cached "hot path" later.

### Cold Data

- `ColdItemController` handles `/api/cold-data`.
- `ColdItemService` verifies the user exists, builds the `ColdItem`, persists it through `ColdItemRepository`, and maps it to `ColdItemResponse`.
- This module represents the lower-frequency, direct-to-DB path.

---

## Practical Mental Model

If you are re-starting work on this project, think of it in two layers:

1. The documented target architecture:
   Spring Boot + PostgreSQL + Redis + Nginx + k6 + observability experiments.
2. The currently implemented codebase:
   A Spring Boot monolith with JWT auth, layered CRUD modules, PostgreSQL entities/repositories, and the initial structure needed for later scaling experiments.

So the code under `Backend/src/main` is the core app skeleton you will keep extending until it matches the larger load-testing architecture described above.

---

## Running the Stack

```bash
# Bring everything up
docker compose up --build

# Server is available at
http://localhost:80
```

Requires Docker and Docker Compose. All services (both Spring Boot instances, PostgreSQL, Redis, Nginx) start from a single compose file.

---

## Load Testing

Scripts live in `infra/k6/scripts/`. Run from the client machine targeting the server's IP.

```bash
# Example — ramp-up test against experiment B (cache ON)
k6 run infra/k6/scripts/exp-b-cache-on.js
```

Three test profiles:

- **Ramp-up** — 10 → 50 → 100 → 200 RPS over ~3 min. Finds degradation point gradually.
- **Spike** — Sudden jump to max load. Tests recovery and error handling.
- **Soak** — Sustained moderate load for 10+ min. Surfaces memory leaks and pool exhaustion.

Pass/fail thresholds: `p95 < 500ms`, `error rate < 1%`

---

## Experiment Matrix

| # | Name | What It Measures |
|---|---|---|
| A | Baseline | No cache, single instance — floor latency and error rate |
| B | Cache ON | Redis added — cache hit ratio, DB query reduction, p95 improvement |
| C | 2× Instances | Nginx + second instance — throughput ceiling vs single instance |
| D | Hot vs Cold Mix | Cache miss penalty — cold data p95 vs hot data p95 under load |
| E | Static File Serve | Nginx-direct vs app-proxied static files — throughput and latency delta |

---

## Observability

Prometheus scrapes `/actuator/prometheus` from both instances. Grafana reads from Prometheus.

Key metrics tracked:
- `p50 / p95 / p99` request latency
- Redis cache hit ratio
- HikariCP active connection count
- Error rate by HTTP status
- RPS by endpoint

> **Why p99 matters:** Under thundering herd, p95 can look healthy while p99 is 10× worse. Outliers are where the real behavior lives.

---

## Auth Model

- Admin-only user creation — no public registration
- JWT carries: `userId`, `username`, `role`, `expiry`
- Tokens stored in Redis with matching TTL → enables instant revocation
- Both instances validate against the same Redis → no session affinity required
- Logout hits `POST /api/auth/logout` which deletes the Redis key immediately

---

## API Surface

| Domain | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/logout` |
| Users | `GET/POST/PUT/PATCH/DELETE /api/users` + bulk create |
| Hot Items | Full CRUD — `GET/POST/PUT/PATCH/DELETE /api/hot-items` |
| Cold Items | Full CRUD — `GET/POST/PUT/PATCH/DELETE /api/cold-items` |
| Static Assets | Metadata CRUD — actual files served by Nginx via `/static/*` |

Role-based access enforced server-side via Spring Security. UI conditionally renders based on JWT role claim — but server always enforces.

---

## Success Metrics

The project is complete when all five experiments have been run and the following are documented:

- [ ] Baseline breaking point (RPS where p95 > 500ms or error rate > 1%)
- [ ] Cache improvement: p95 reduction % and DB query reduction % after Redis
- [ ] Horizontal scaling gain: max sustainable RPS with 1 vs 2 instances
- [ ] Cold vs hot latency gap quantified under load
- [ ] Static file throughput: Nginx-direct vs Spring-proxied
- [ ] Final comparison table across all five experiments
