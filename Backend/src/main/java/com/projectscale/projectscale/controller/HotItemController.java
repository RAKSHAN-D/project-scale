package com.projectscale.projectscale.controller;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; 
import com.projectscale.projectscale.dto.HotItemRequest;
import com.projectscale.projectscale.dto.HotItemResponse;
import com.projectscale.projectscale.services.HotItemService;

@RestController
@RequestMapping("/api/hot-data")
public class HotItemController {
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

    @GetMapping("/{id}")
    public ResponseEntity<HotItemResponse> getHotItemById(@PathVariable Long id) {
        return ResponseEntity.ok(hotItemService.getHotItemById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotItem(@PathVariable Long id) {
        hotItemService.deleteHotItem(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<HotItemResponse> updateHotItem(@PathVariable Long id, @RequestBody HotItemRequest request) {
        return ResponseEntity.ok(hotItemService.updateHotItem(id, request));
    }
}