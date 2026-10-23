package com.projectscale.projectscale.controller;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; 
import com.projectscale.projectscale.dto.HotItemRequest;
import com.projectscale.projectscale.dto.HotItemResponse;
import com.projectscale.projectscale.dto.MessageResponse;
import com.projectscale.projectscale.dto.UpdateHotItemRequest;
import com.projectscale.projectscale.services.HotItemService;

@RestController
@RequestMapping("/api/hot-data")
public class HotItemController {

    /*
     * Important controller annotations:
     * @RequestBody  - converts the request JSON body into a Java DTO object.
     * @PathVariable - reads a value embedded in the URL path, such as /user/{userId}.
     * @RequestParam - reads a query-string value, such as /hot-data?itemKey=profile.
     * @Valid        - checks the validation rules declared inside the request DTO.
     */
    private final HotItemService hotItemService;

    public HotItemController(HotItemService hotItemService) {
        this.hotItemService = hotItemService;
    }
    @PostMapping
    public ResponseEntity<HotItemResponse> createHotItem(@Valid @RequestBody HotItemRequest request) {
        return ResponseEntity.status(201).body(hotItemService.createHotItem(request));
    }

    @GetMapping
    public ResponseEntity<List<HotItemResponse>> getAllHotItems() {
        return ResponseEntity.ok(hotItemService.getAllHotItems());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<HotItemResponse>> getHotItemsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(hotItemService.getHotItemsForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotItemResponse> getHotItemById(@PathVariable Long id) {
        return ResponseEntity.ok(hotItemService.getHotItemById(id));
    }

    @GetMapping("/user/{userId}/item/{id}")
    public ResponseEntity<HotItemResponse> getHotItemForUser(@PathVariable Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(hotItemService.getHotItemForUser(userId, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteHotItem(@PathVariable Long id) {
        hotItemService.deleteHotItem(id);
        return ResponseEntity.ok(new MessageResponse("Hot item deleted successfully"));
    }

    @DeleteMapping("/user/{userId}/item/{id}")
    public ResponseEntity<MessageResponse> deleteHotItemForUser(@PathVariable Long userId, @PathVariable Long id) {
        hotItemService.deleteHotItem(userId, id);
        return ResponseEntity.ok(new MessageResponse("Hot item deleted successfully"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<HotItemResponse> updateHotItem(
            @PathVariable Long id,
            @RequestBody UpdateHotItemRequest request) {
        return ResponseEntity.ok(hotItemService.updateHotItem(id, request));
    }

    @PatchMapping("/user/{userId}/item/{id}")
    public ResponseEntity<HotItemResponse> updateHotItemForUser(
            @PathVariable Long userId,
            @PathVariable Long id,
            @RequestBody UpdateHotItemRequest request) {
        return ResponseEntity.ok(hotItemService.updateHotItem(userId, id, request));
    }
}
