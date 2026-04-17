package com.projectscale.projectscale.controller;
import java.util.List;
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
    public ResponseEntity<ColdDataResponse> addColdData(@RequestBody ColdDataRequest request) {
        return ResponseEntity.status(201).body(coldDataService.addColdData(request));
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ColdDataResponse>> getColdDataForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(coldDataService.getColdDataForUser(userId));
    }
    @GetMapping
    public ResponseEntity<List<ColdDataResponse>> getAllColdData() {
        return ResponseEntity.ok(coldDataService.getAllColdData());
    }
    @PutMapping("/{id}")
    public ResponseEntity<ColdDataResponse> updateColdData(@PathVariable Long id, @RequestBody ColdDataRequest request) {
        return ResponseEntity.ok(coldDataService.updateColdData(id, request));
    }
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteColdDataForUser(@PathVariable Long userId) {
        coldDataService.deleteColdDataForUser(userId);
        return ResponseEntity.noContent().build();
    }
}