package com.projectscale.projectscale.services;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import com.projectscale.projectscale.dto.HotItemRequest;
import com.projectscale.projectscale.dto.HotItemResponse;
import com.projectscale.projectscale.entity.HotItem;
import com.projectscale.projectscale.repository.HotItemRepository;
import org.springframework.security.access.prepost.PreAuthorize;
@Service
public class HotItemService {
    private final HotItemRepository hotItemRepository;
    public HotItemService(HotItemRepository hotItemRepository) {
        this.hotItemRepository = hotItemRepository;   // Constructor injection of the repository
    }
    @PreAuthorize("hasRole('ADMIN')")
    public HotItemResponse createHotItem(HotItemRequest request) {
    // Basic Validation is handled by @Valid in the DTO layer, so we can assume the request is valid here. 
    
    /*if (request.getItemKey() == null || request.getItemKey().trim().isEmpty()) {
        throw new IllegalArgumentException("itemKey is required.");
    }
    if (request.getValue() == null || request.getValue().isEmpty()) {
        throw new IllegalArgumentException("value is required.");
    }*/

    //  Extract values
    String itemKey = request.getItemKey().trim();
    Map<String, Object> value = request.getValue();
    
    // Check for duplicate itemKey
    if (hotItemRepository.existsByItemKey(itemKey)) {
        throw new IllegalArgumentException("An item with this key already exists.");
    }

    //  Create Entity
    HotItem hotItem = new HotItem();
    hotItem.setItemKey(itemKey);
    hotItem.setValue(value);

    //  Save Entity
     HotItem savedHotItem = hotItemRepository.save(hotItem);
     return toHotItemResponse(savedHotItem);
    }
    //  Return response
   private HotItemResponse toHotItemResponse(HotItem savedHotItem) {
        HotItemResponse response = new HotItemResponse();
        response.setId(savedHotItem.getId());
        response.setItemKey(savedHotItem.getItemKey());
        response.setValue(savedHotItem.getValue());
        response.setUpdatedAt(savedHotItem.getUpdatedAt());
        return response;
    }
    @PreAuthorize("hasRole('ADMIN')")
    public List<HotItemResponse> getAllHotItems() {
        List<HotItem> hotItems = hotItemRepository.findAll();
        return hotItems.stream().map(this::toHotItemResponse).toList();
    }
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public HotItemResponse getHotItemById(Long id) {
        HotItem hotItem = hotItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hot item not found"));
        return toHotItemResponse(hotItem);
    }
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id" )
    public void deleteHotItem(Long id) {
        if (!hotItemRepository.existsById(id)) {
            throw new RuntimeException("Hot item not found");
        }
        hotItemRepository.deleteById(id);
     }
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public void deleteAllHotItems() {
        hotItemRepository.deleteAll();
    }   



}

