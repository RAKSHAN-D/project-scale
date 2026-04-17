package com.projectscale.projectscale.services;
import java.util.List;
import org.springframework.stereotype.Service;
import com.projectscale.projectscale.dto.ColdDataResponse;
import com.projectscale.projectscale.entity.ColdItem;
import com.projectscale.projectscale.repository.ColdItemRepository;

@Service
public class ColdDataService {
    private final ColdItemRepository coldItemRepository;
    private final UserRepository userRepository;
    public ColdDataService(ColdItemRepository coldItemRepository, UserRepository userRepository) {
        this.coldItemRepository = coldItemRepository;   // Constructor injection of the repository
        this.userRepository = userRepository;   // Constructor injection of the user repository
    }
     @PreAuthorize("hasRole('ADMIN')")
public ColdDataResponse addColdData(ColdDataRequest request) {

    // 1. Basic Validation
    if (request.getUserId() == null ||
        request.getType() == null ||
        request.getPayload() == null || request.getPayload().trim().isEmpty()) {
        throw new IllegalArgumentException("User ID, type, and payload are required.");
    }

    // 2. Extract values
    Long userId = request.getUserId();
    String payload = request.getPayload();

    // 3. Convert type (String → Enum)
    ColdItemType type;
    try {
        type = ColdItemType.valueOf(request.getType().toUpperCase());
    } catch (Exception e) {
        throw new IllegalArgumentException("Invalid type value.");
    }

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
public List<ColdDataResponse> getColdDataForUser(Long userId) {
 if (userRepository.findById(userId).isEmpty())
 { throw new RuntimeException("User not found");} 
  
 List<ColdItem> coldItems = coldItemRepository.findByUser_Id(userId);
 return coldItems.stream().map(ColdDataResponse::new).toList();
}

@PreAuthorize("hasRole('ADMIN')")
public List<ColdDataResponse> getAllColdData() {
    List<ColdItem> coldItems = coldItemRepository.findAll();
    return coldItems.stream().map(ColdDataResponse::new).toList();
} 

@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
public void updateColdData(Long id, ColdDataRequest request) {
    if (userRepository.findById(userId).isEmpty()) {
        throw new RuntimeException("User not found");
    }
    ColdItem existingItem = coldItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cold data item not found."));
    existingItem.setPayload(request.getPayload());
    coldItemRepository.save(existingItem);
}
@PreAuthorize("hasRole('ADMIN')")
public void deleteColdDataForUser(Long userId) {
    if (userRepository.findById(userId).isEmpty()) {
        throw new RuntimeException("User not found");
    }
    coldItemRepository.deleteByUser_Id(userId);
}
public coldataResponse toColdDataResponse(ColdItem item) {
    ColdDataResponse response = new ColdDataResponse();
    response.setId(item.getId());
    response.setUserId(item.getUser().getId());
    response.setType(item.getType().name());
    response.setPayload(item.getPayload());
    response.setCreatedAt(item.getCreatedAt());
    return response;
}
}