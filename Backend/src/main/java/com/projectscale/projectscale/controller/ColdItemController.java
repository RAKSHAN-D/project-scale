package com.projectscale.projectscale.controller;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.* ;
import com.projectscale.projectscale.dto.ColdDataRequest;
import com.projectscale.projectscale.dto.ColdDataResponse;
import com.projectscale.projectscale.services.ColdDataService;
@RestController
@RequestMapping("/api/cold-data")
public class ColdItemController {
    private final ColdDataService coldDataService;
    public ColdItemController(ColdDataService coldDataService) {
        this.coldDataService = coldDataService; // Constructor injection of the service
    }
    @PostMapping
    public ResponseEntity<ColdDataResponse> addColdData(@Valid @RequestBody ColdDataRequest request) {
        return ResponseEntity.status(201).body(coldDataService.addColdData(request));
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ColdDataResponse>> getColdDataForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(coldDataService.getColdDataForUser(userId));
    }
    @GetMapping("item/{itemId}")
    public ResponseEntity<ColdDataResponse> getColdDataForUserAndItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(coldDataService.getColdDataForUserAndItem(itemId));
    }
    @GetMapping
    public ResponseEntity<List<ColdDataResponse>> getAllColdData() {
        return ResponseEntity.ok(coldDataService.getAllColdData());
    }
    @PutMapping("/{id}")
    public ResponseEntity<ColdDataResponse> updateColdData(@PathVariable Long id, @Valid @RequestBody ColdDataRequest request) {
        return ResponseEntity.ok(coldDataService.updateColdData(id, request));
    }
    @DeleteMapping("item/{itemId}")
    public ResponseEntity<Void> deleteColdData( @PathVariable Long itemId) {
        coldDataService.deleteColdData(itemId);
        return ResponseEntity.noContent().build();
    }
}