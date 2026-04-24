package com.projectscale.projectscale.services;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.projectscale.projectscale.dto.ColdItemRequest;
import com.projectscale.projectscale.dto.ColdItemResponse;
import com.projectscale.projectscale.entity.ColdItem;
import com.projectscale.projectscale.entity.ColdItemType;
import com.projectscale.projectscale.entity.User;
import com.projectscale.projectscale.repository.ColdItemRepository;
import com.projectscale.projectscale.repository.UserRepository;

@Service
public class ColdItemService {
    private final ColdItemRepository coldItemRepository;
    private final UserRepository userRepository;
    public ColdItemService(ColdItemRepository coldItemRepository, UserRepository userRepository) {
        this.coldItemRepository = coldItemRepository;   // Constructor injection of the repository
        this.userRepository = userRepository;   // Constructor injection of the user repository
    }
    @PreAuthorize("hasRole('ADMIN')")
    public ColdItemResponse addColdData(ColdItemRequest request) {

    // 1. Basic Validation
    if (request.getUserId() == null ||
        request.getType() == null ||
        request.getPayload() == null || request.getPayload().trim().isEmpty()) {
        throw new IllegalArgumentException("User ID, type, and payload are required.");
    }

    // 2. Extract values
    Long userId = request.getUserId();
    String payload = request.getPayload();

    ColdItemType type = request.getType();

    // 4. Fetch User from DB (VERY IMPORTANT)
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // 5. Create Entity
    ColdItem newColdItem = new ColdItem();
    newColdItem.setUser(user);
    newColdItem.setType(type);
    newColdItem.setPayload(payload);
    // createdAt is auto-handled

    // 6. Save (use returned entity)
    ColdItem savedItem = coldItemRepository.save(newColdItem);

    // 7. Convert to ResponseDTO
    return toColdDataResponse(savedItem);
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public List<ColdItemResponse> getColdDataForUser(Long userId) {
        if (userRepository.findById(userId).isEmpty()) {
            throw new RuntimeException("User not found");
        }
        List<ColdItem> coldItems = coldItemRepository.findByUser_Id(userId);
        return coldItems.stream().map(this::toColdDataResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<ColdItemResponse> getAllColdData() {
        List<ColdItem> coldItems = coldItemRepository.findAll();
        return coldItems.stream().map(this::toColdDataResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ColdItemResponse getColdDataForUserAndItem(Long itemId) {
        ColdItem item = coldItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cold data item not found."));
        return toColdDataResponse(item);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ColdItemResponse updateColdData(Long id, ColdItemRequest request) {
        ColdItem existingItem = coldItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cold data item not found."));

        if (request.getPayload() != null && !request.getPayload().trim().isEmpty()) {
            existingItem.setPayload(request.getPayload());
        }
        if (request.getType() != null) {
            existingItem.setType(request.getType());
        }

        ColdItem savedItem = coldItemRepository.save(existingItem);
        return toColdDataResponse(savedItem);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteColdData(Long itemId) {
        if (!coldItemRepository.existsById(itemId)) {
            throw new RuntimeException("Cold data item not found");
        }
        coldItemRepository.deleteById(itemId);
    }

    private ColdItemResponse toColdDataResponse(ColdItem item) {
        ColdItemResponse response = new ColdItemResponse();
        response.setId(item.getId());
        response.setData(item.getPayload());
        return response;
    }
}