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
| Auth | `POST /api/auth/login`, `POST /api/auth/logout` | POST /api/auth/signup 
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
