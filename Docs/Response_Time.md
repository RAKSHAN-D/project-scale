# Response Time Notes

This file tracks local API response-time observations during Phase 1 localhost testing.

Current setup:

- 1 Spring Boot backend instance
- 1 PostgreSQL database
- Testing tool: Postman
- Auth: JWT Bearer token
- Static module: paused for now

---

## User Module

### Current Data State

At the time of this test:

- 1 admin user
- Normal users created from `user1` to `user14`
- `user11` was deleted during delete endpoint testing

Approximate active user count after delete:

```text
1 admin + 13 normal users = 14 users
```

---

## User Endpoint Results

### Get All Users

Endpoint:

```http
GET /api/users
```

Auth:

```text
ADMIN JWT
```

Observed response time:

```text
15.66 ms
```

Status:

```text
200 OK
```

Notes:

- Returned admin user and normal users.
- At this small data size, response time is mostly Spring/Security/DB round-trip overhead.

---

### Get User By Id

Endpoint:

```http
GET /api/users/{id}
```

Example tested:

```http
GET /api/users/3
```

Observed response time:

```text
~15 ms
```

Status:

```text
200 OK
```

Response sample:

```json
{
  "email": "user2@gmail.com",
  "id": 3,
  "role": "SECOND_CLASS",
  "username": "user2"
}
```

---

### Create User

Endpoint:

```http
POST /api/users
```

Auth:

```text
ADMIN JWT
```

Observed response times:

| Test | User | Response Time |
|---|---:|---:|
| Earlier batch | `user6` to `user10` | 96 ms to 105 ms |
| Create | `user11` | 112 ms |
| Create | `user12` | 107 ms |
| Create | `user13` | 97 ms |
| Create | `user14` | 93 ms |

Observed range:

```text
93 ms to 112 ms
```

Notes:

- Create user is slower than read/update/delete because it includes BCrypt password hashing.
- It also checks duplicate username and duplicate email before inserting into DB.

---

### Update User

Endpoint:

```http
PUT /api/users/{id}
```

Auth:

```text
ADMIN JWT
```

Current behavior:

```text
Although the endpoint uses PUT, the code behaves like a partial update.
Only the fields sent in the request body are updated.
```

#### User 3 Update Tests

Update type:

```text
Only username updated
```

Observed response times:

| Attempt | Response Time |
|---:|---:|
| 1 | 56 ms |
| 2 | 18 ms |
| 3 | 19 ms |
| 4 | 15 ms |
| 5 | 14 ms |

Observed range:

```text
14 ms to 56 ms
```

#### User 2 Update Tests

Update type:

```text
Username and email updated
```

Observed response times:

| Attempt | Response Time |
|---:|---:|
| 1 | 17 ms |
| 2 | 23 ms |
| 3 | 43 ms |
| 4 | 46 ms |
| 5 | 21 ms |

Observed range:

```text
17 ms to 46 ms
```

Notes:

- Username/email update is faster than create because password hashing is not involved.
- Response time can still vary because of DB checks, JVM warmup, Postman measurement, and local machine activity.

---

### Delete User

Endpoint:

```http
DELETE /api/users/{id}
```

Auth:

```text
ADMIN JWT
```

Observed response times:

| Attempt | Response Time |
|---:|---:|
| 1 | 14 ms |
| 2 | 12 ms |
| 3 | 14 ms |

Observed range:

```text
12 ms to 14 ms
```

Expected status:

```text
204 No Content
```

Notes:

- `204 No Content` means delete succeeded.
- No response body is expected for this endpoint.

---

## User Module Summary

| Operation | Endpoint | Response-Time Range |
|---|---|---:|
| Get all users | `GET /api/users` | 15.66 ms |
| Get user by id | `GET /api/users/{id}` | ~15 ms |
| Create user | `POST /api/users` | 93 ms to 112 ms |
| Update username only | `PUT /api/users/{id}` | 14 ms to 56 ms |
| Update username + email | `PUT /api/users/{id}` | 17 ms to 46 ms |
| Delete user | `DELETE /api/users/{id}` | 12 ms to 14 ms |

Main observation:

```text
Create user is the slowest user-module operation because it includes BCrypt password hashing.
Read, update, and delete are much faster at the current small data size.
```
