package com.projectscale.projectscale.controller;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.* ;
import com.projectscale.projectscale.dto.ColdItemRequest;
import com.projectscale.projectscale.dto.ColdItemResponse;
import com.projectscale.projectscale.services.ColdItemService;
@RestController
@RequestMapping("/api/cold-data")
public class ColdItemController {
    private final ColdItemService coldItemService;
    public ColdItemController(ColdItemService coldItemService) {
        this.coldItemService = coldItemService; // Constructor injection of the service
    }
    @PostMapping
    public ResponseEntity<ColdItemResponse> addColdData(@Valid @RequestBody ColdItemRequest request) {
        return ResponseEntity.status(201).body(coldItemService.addColdData(request));
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ColdItemResponse>> getColdDataForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(coldItemService.getColdDataForUser(userId));
    }
    @GetMapping("item/{itemId}")
    public ResponseEntity<ColdItemResponse> getColdDataForUserAndItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(coldItemService.getColdDataForUserAndItem(itemId));
    }
    @GetMapping
    public ResponseEntity<List<ColdItemResponse>> getAllColdData() {
        return ResponseEntity.ok(coldItemService.getAllColdData());
    }
    @PutMapping("/{id}")
    public ResponseEntity<ColdItemResponse> updateColdData(@PathVariable Long id, @Valid @RequestBody ColdItemRequest request) {
        return ResponseEntity.ok(coldItemService.updateColdData(id, request));
    }
    @DeleteMapping("item/{itemId}")
    public ResponseEntity<Void> deleteColdData( @PathVariable Long itemId) {
        coldItemService.deleteColdData(itemId);
        return ResponseEntity.noContent().build();
    }
}