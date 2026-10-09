package com.projectscale.projectscale.services;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.projectscale.projectscale.dto.HotItemRequest;
import com.projectscale.projectscale.dto.HotItemResponse;
import com.projectscale.projectscale.entity.HotItem;
import com.projectscale.projectscale.entity.User;
import com.projectscale.projectscale.repository.HotItemRepository;
import com.projectscale.projectscale.repository.UserRepository;

@Service
public class HotItemService {
    private final HotItemRepository hotItemRepository;
    private final UserRepository userRepository;

    public HotItemService(HotItemRepository hotItemRepository, UserRepository userRepository) {
        this.hotItemRepository = hotItemRepository;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('ADMIN') or #request.userId == authentication.principal.id")
    public HotItemResponse createHotItem(HotItemRequest request) {
        String itemKey = request.getItemKey().trim();
        Map<String, Object> value = request.getValue();

        if (hotItemRepository.existsByItemKey(itemKey)) {
            throw new IllegalArgumentException("An item with this key already exists.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        HotItem hotItem = new HotItem();
        hotItem.setUser(user);
        hotItem.setItemKey(itemKey);
        hotItem.setValue(value);

        return toHotItemResponse(hotItemRepository.save(hotItem));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<HotItemResponse> getAllHotItems() {
        return hotItemRepository.findAll().stream().map(this::toHotItemResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public List<HotItemResponse> getHotItemsForUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        return hotItemRepository.findByUser_Id(userId).stream().map(this::toHotItemResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public HotItemResponse getHotItemById(Long id) {
        return toHotItemResponse(getHotItemOrThrow(id));
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public HotItemResponse getHotItemForUser(Long userId, Long id) {
        HotItem hotItem = getHotItemOrThrow(id);
        validateUserOwnsHotItem(hotItem, userId);
        return toHotItemResponse(hotItem);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteHotItem(Long id) {
        HotItem hotItem = getHotItemOrThrow(id);
        hotItemRepository.delete(hotItem);
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public void deleteHotItem(Long userId, Long id) {
        HotItem hotItem = getHotItemOrThrow(id);
        validateUserOwnsHotItem(hotItem, userId);
        hotItemRepository.delete(hotItem);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public HotItemResponse updateHotItem(Long id, HotItemRequest request) {
        HotItem hotItem = getHotItemOrThrow(id);
        return updateExistingHotItem(hotItem, request);
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public HotItemResponse updateHotItem(Long userId, Long id, HotItemRequest request) {
        HotItem hotItem = getHotItemOrThrow(id);
        validateUserOwnsHotItem(hotItem, userId);
        return updateExistingHotItem(hotItem, request);
    }

    private HotItemResponse updateExistingHotItem(HotItem hotItem, HotItemRequest request) {
        if (request.getItemKey() != null && !request.getItemKey().trim().isEmpty()) {
            String newKey = request.getItemKey().trim();
            String currentKey = hotItem.getItemKey();

            if (!newKey.equals(currentKey)) {
                if (hotItemRepository.existsByItemKey(newKey)) {
                    throw new IllegalArgumentException("An item with this key already exists.");
                }
                hotItem.setItemKey(newKey);
            }
        }

        if (request.getValue() != null) {
            hotItem.setValue(request.getValue());
        }

        return toHotItemResponse(hotItemRepository.save(hotItem));
    }

    private HotItem getHotItemOrThrow(Long id) {
        return hotItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hot item not found"));
    }

    private void validateUserOwnsHotItem(HotItem hotItem, Long userId) {
        if (!hotItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Hot item does not belong to this user");
        }
    }

    private HotItemResponse toHotItemResponse(HotItem hotItem) {
        HotItemResponse response = new HotItemResponse();
        response.setId(hotItem.getId());
        response.setUserId(hotItem.getUser().getId());
        response.setItemKey(hotItem.getItemKey());
        response.setValue(hotItem.getValue());
        response.setUpdatedAt(hotItem.getUpdatedAt());
        return response;
    }
}
