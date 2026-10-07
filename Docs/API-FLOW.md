# API Flow

This document explains the end-to-end flow of one `POST` API and one `GET` API for the `ColdItem` module.

The goal is to refresh the full Spring Boot CRUD path:

```text
HTTP Request
    -> Controller
    -> DTO
    -> Service
    -> Repository
    -> JPA / Hibernate
    -> PostgreSQL DB
```

And then the response comes back:

```text
PostgreSQL DB
    -> Hibernate / JPA
    -> Repository
    -> Service
    -> Response DTO
    -> Controller
    -> HTTP Response
```

---

## Big Picture

For the `ColdItem` feature, the important files are:

| Layer | File | Purpose |
|---|---|---|
| Entity | `ColdItem.java` | Maps Java object to `cold_items` DB table |
| Enum | `ColdItemType.java` | Defines allowed cold item types |
| Request DTO | `ColdItemRequest.java` | Receives data from client request body |
| Response DTO | `ColdItemResponse.java` | Sends clean response back to client |
| Controller | `ColdItemController.java` | Exposes HTTP endpoints |
| Service | `ColdItemService.java` | Holds business logic |
| Repository | `ColdItemRepository.java` | Talks to DB through Spring Data JPA |
| Related Repository | `UserRepository.java` | Used to check/load the user before saving cold data |

The main rule:

```text
Controller should not directly talk to Repository.
Controller talks to Service.
Service talks to Repository.
Repository talks to DB.
```

---

## Dependency Injection In This Flow

Dependency Injection means Spring creates the needed objects and gives them to the class through the constructor.

In this project, `ColdItemController` needs `ColdItemService`.

```java
private final ColdItemService coldItemService;

public ColdItemController(ColdItemService coldItemService) {
    this.coldItemService = coldItemService;
}
```

This means:

```text
Spring creates ColdItemService
Spring creates ColdItemController
Spring injects ColdItemService into ColdItemController
```

Then `ColdItemService` needs repositories:

```java
private final ColdItemRepository coldItemRepository;
private final UserRepository userRepository;

public ColdItemService(ColdItemRepository coldItemRepository, UserRepository userRepository) {
    this.coldItemRepository = coldItemRepository;
    this.userRepository = userRepository;
}
```

This means:

```text
Spring creates ColdItemRepository
Spring creates UserRepository
Spring creates ColdItemService
Spring injects both repositories into ColdItemService
```

This is constructor-based DI. It is the preferred style because dependencies are clear and required.

---

## Entity Layer

File:

`Backend/src/main/java/com/projectscale/projectscale/entity/ColdItem.java`

The entity represents a row in the `cold_items` table.

```java
@Entity
@Table(name = "cold_items")
public class ColdItem {
```

Important fields:

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

This is the primary key. PostgreSQL generates it.

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;
```

Each cold item belongs to one user. In the DB, this becomes a `user_id` foreign key.

```java
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 20)
private ColdItemType type;
```

The type is stored as text, for example `TYPE_A`, `TYPE_B`, or `TYPE_C`.

```java
@JdbcTypeCode(SqlTypes.JSON)
@Column(nullable = false, columnDefinition = "jsonb")
private String payload;
```

This stores JSON-style data in PostgreSQL as `jsonb`.

```java
@Column(name = "created_at", nullable = false, updatable = false)
private OffsetDateTime createdAt = OffsetDateTime.now();
```

This stores when the row was created.

---

## DTO Layer

DTO means Data Transfer Object.

DTOs are used at the API boundary so the controller does not expose the full entity directly.

### Request DTO

File:

`Backend/src/main/java/com/projectscale/projectscale/dto/ColdItemRequest.java`

Current fields:

```java
private Long userId;
private String payload;
private ColdItemType type;
```

Example JSON request:

```json
{
  "userId": 1,
  "payload": "{\"name\":\"sample cold data\",\"value\":100}",
  "type": "TYPE_A"
}
```

This request body becomes a `ColdItemRequest` object because the controller uses:

```java
@RequestBody ColdItemRequest request
```

Validation annotations:

```java
@NotNull
@NotBlank
```

These work when the controller uses:

```java
@Valid @RequestBody ColdItemRequest request
```

### Response DTO

File:

`Backend/src/main/java/com/projectscale/projectscale/dto/ColdItemResponse.java`

Current fields:

```java
private Long id;
private String data;
```

This is what the API sends back to the client.

The service converts entity to response DTO using:

```java
private ColdItemResponse toColdDataResponse(ColdItem item) {
    ColdItemResponse response = new ColdItemResponse();
    response.setId(item.getId());
    response.setData(item.getPayload());
    return response;
}
```

---

## Repository Layer

File:

`Backend/src/main/java/com/projectscale/projectscale/repository/ColdItemRepository.java`

Current repository:

```java
public interface ColdItemRepository extends JpaRepository<ColdItem, Long> {
    List<ColdItem> findByUser_Id(Long userId);
}
```

Because it extends `JpaRepository`, Spring Data JPA automatically gives methods like:

```java
save(entity)
findById(id)
findAll()
deleteById(id)
existsById(id)
```

So we do not manually write Hibernate `Session` code.

The flow is:

```text
coldItemRepository.save(item)
    -> Spring Data JPA
    -> Hibernate
    -> SQL INSERT / UPDATE
    -> PostgreSQL
```

Custom finder:

```java
List<ColdItem> findByUser_Id(Long userId);
```

Spring understands this method name and creates a query based on the `user.id` field.

Conceptually, it becomes something like:

```sql
SELECT * FROM cold_items WHERE user_id = ?;
```

---

## POST API Flow

Endpoint:

```text
POST /api/cold-data
```

Controller method:

```java
@PostMapping
public ResponseEntity<ColdItemResponse> addColdData(
        @Valid @RequestBody ColdItemRequest request) {
    return ResponseEntity.status(201).body(coldItemService.addColdData(request));
}
```

### Step 1: Client Sends Request

Example:

```http
POST /api/cold-data
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Body:

```json
{
  "userId": 1,
  "payload": "{\"topic\":\"orders\",\"count\":25}",
  "type": "TYPE_A"
}
```

### Step 2: Spring Maps JSON To DTO

Spring sees:

```java
@RequestBody ColdItemRequest request
```

So it converts the JSON body into:

```java
ColdItemRequest
```

Now Java can access:

```java
request.getUserId()
request.getPayload()
request.getType()
```

### Step 3: Controller Calls Service

The controller does not save to DB directly.

It calls:

```java
coldItemService.addColdData(request)
```

### Step 4: Service Validates Data

Service method:

```java
public ColdItemResponse addColdData(ColdItemRequest request)
```

It checks:

```java
if (request.getUserId() == null ||
    request.getType() == null ||
    request.getPayload() == null || request.getPayload().trim().isEmpty()) {
    throw new IllegalArgumentException("User ID, type, and payload are required.");
}
```

This protects the DB from invalid data.

### Step 5: Service Extracts Values

```java
Long userId = request.getUserId();
String payload = request.getPayload();
ColdItemType type = request.getType();
```

### Step 6: Service Loads User

Before creating a cold item, the service checks if the user exists:

```java
User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
```

This is important because `ColdItem` has a required `User`.

Without a valid user, the `user_id` foreign key cannot be saved safely.

### Step 7: Service Creates Entity

```java
ColdItem newColdItem = new ColdItem();
newColdItem.setUser(user);
newColdItem.setType(type);
newColdItem.setPayload(payload);
```

At this point, the DTO has been converted into an entity.

DTO:

```text
ColdItemRequest
```

Entity:

```text
ColdItem
```

### Step 8: Repository Saves Entity

```java
ColdItem savedItem = coldItemRepository.save(newColdItem);
```

This is where DB persistence happens.

Internally:

```text
JpaRepository.save()
    -> EntityManager
    -> Hibernate
    -> PostgreSQL INSERT
```

Conceptual SQL:

```sql
INSERT INTO cold_items (user_id, type, payload, created_at)
VALUES (?, ?, ?::jsonb, ?);
```

### Step 9: Service Converts Entity To Response DTO

```java
return toColdDataResponse(savedItem);
```

Mapping:

```java
response.setId(item.getId());
response.setData(item.getPayload());
```

### Step 10: Controller Returns HTTP Response

```java
ResponseEntity.status(201).body(...)
```

Final response:

```http
201 Created
```

Example body:

```json
{
  "id": 10,
  "data": "{\"topic\":\"orders\",\"count\":25}"
}
```

Full POST flow:

```text
POST /api/cold-data
    -> ColdItemController.addColdData()
    -> ColdItemRequest DTO
    -> ColdItemService.addColdData()
    -> UserRepository.findById()
    -> create ColdItem entity
    -> ColdItemRepository.save()
    -> Hibernate INSERT
    -> PostgreSQL cold_items table
    -> saved ColdItem entity
    -> ColdItemResponse DTO
    -> 201 Created response
```

---

## GET API Flow

Endpoint:

```text
GET /api/cold-data/user/{userId}
```

Controller method:

```java
@GetMapping("/user/{userId}")
public ResponseEntity<List<ColdItemResponse>> getColdDataForUser(
        @PathVariable Long userId) {
    return ResponseEntity.ok(coldItemService.getColdDataForUser(userId));
}
```

### Step 1: Client Sends Request

Example:

```http
GET /api/cold-data/user/1
Authorization: Bearer <jwt-token>
```

### Step 2: Spring Reads Path Variable

The route has:

```java
@GetMapping("/user/{userId}")
```

The method has:

```java
@PathVariable Long userId
```

So this URL:

```text
/api/cold-data/user/1
```

becomes:

```java
Long userId = 1L;
```

### Step 3: Controller Calls Service

```java
coldItemService.getColdDataForUser(userId)
```

### Step 4: Security Rule Is Checked

Service method:

```java
@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
public List<ColdItemResponse> getColdDataForUser(Long userId)
```

Meaning:

```text
Allow ADMIN.
Or allow the user if they are requesting their own cold data.
```

### Step 5: Service Checks User Exists

```java
if (userRepository.findById(userId).isEmpty()) {
    throw new RuntimeException("User not found");
}
```

This avoids returning data for a user that does not exist.

### Step 6: Repository Reads Cold Items

```java
List<ColdItem> coldItems = coldItemRepository.findByUser_Id(userId);
```

Spring Data JPA understands:

```text
findByUser_Id
```

as:

```text
Find cold items where item.user.id = userId
```

Conceptual SQL:

```sql
SELECT *
FROM cold_items
WHERE user_id = ?;
```

### Step 7: Service Converts Entities To Response DTOs

```java
return coldItems.stream()
        .map(this::toColdDataResponse)
        .toList();
```

Each `ColdItem` entity becomes one `ColdItemResponse`.

### Step 8: Controller Returns HTTP Response

```java
ResponseEntity.ok(...)
```

Final response:

```http
200 OK
```

Example body:

```json
[
  {
    "id": 10,
    "data": "{\"topic\":\"orders\",\"count\":25}"
  },
  {
    "id": 11,
    "data": "{\"topic\":\"profile\",\"status\":\"active\"}"
  }
]
```

Full GET flow:

```text
GET /api/cold-data/user/1
    -> ColdItemController.getColdDataForUser()
    -> @PathVariable userId
    -> ColdItemService.getColdDataForUser()
    -> @PreAuthorize check
    -> UserRepository.findById()
    -> ColdItemRepository.findByUser_Id()
    -> Hibernate SELECT
    -> PostgreSQL cold_items table
    -> List<ColdItem>
    -> List<ColdItemResponse>
    -> 200 OK response
```

---

## Where Hibernate Fits

You do not directly write:

```java
Session session = sessionFactory.openSession();
session.save(entity);
```

Because this project uses Spring Data JPA.

The repository hides the lower-level Hibernate session work.

When you write:

```java
coldItemRepository.save(newColdItem);
```

Spring internally handles:

```text
Transaction
Persistence context
Hibernate session
SQL generation
JDBC execution
```

So in this project:

```text
Repository is your DB access boundary.
Hibernate is the ORM engine underneath.
```

---

## What Each Layer Should Do

### Controller

Should:

- expose routes
- receive request body/path variables
- call service
- return HTTP response

Should not:

- contain business rules
- call repository directly
- create SQL queries

### Service

Should:

- validate business rules
- check permissions with method security
- load related entities
- convert DTO to entity
- call repositories
- convert entity to response DTO

### Repository

Should:

- provide DB operations
- extend `JpaRepository`
- define finder methods like `findByUser_Id`

Should not:

- contain controller logic
- contain HTTP logic

### Entity

Should:

- represent DB table structure
- contain JPA annotations
- define relationships

### DTO

Should:

- represent request/response shape
- protect entity from being exposed directly

---

## Current Code Notes

The cold item flow is mostly in the correct layered shape:

```text
Controller -> Service -> Repository -> DB
```

Useful future improvements:

- `ColdItemResponse` currently returns only `id` and `data`; later it can include `userId`, `type`, and `createdAt`.
- The route `@GetMapping("item/{itemId}")` should preferably include a leading slash: `@GetMapping("/item/{itemId}")`.
- The route `@DeleteMapping("item/{itemId}")` should preferably include a leading slash: `@DeleteMapping("/item/{itemId}")`.
- The JSON payload is stored as `String` with `jsonb`; later, it may be cleaner to use `Map<String, Object>` like `HotItem`.
- `@PreAuthorize` on user-specific reads depends on `authentication.principal.id`; this works properly only if the authenticated principal exposes `id`.

---

## Memory Shortcut

For `POST`, think:

```text
Request JSON -> Request DTO -> Entity -> save() -> DB -> Response DTO
```

For `GET`, think:

```text
Path variable -> repository query -> Entity list -> Response DTO list
```

For DI, think:

```text
Controller needs Service.
Service needs Repository.
Spring injects them through constructors.
```
