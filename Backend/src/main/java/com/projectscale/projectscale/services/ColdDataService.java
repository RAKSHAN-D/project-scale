package com.projectscale.projectscale.services;
import java.util.List;
import org.springframework.stereotype.Service;
import com.projectscale.projectscale.dto.ColdDataResponse;
import com.projectscale.projectscale.entity.ColdItem;
import com.projectscale.projectscale.repository.ColdItemRepository;

@Service
public class ColdDataService {
    private final ColdItemRepository coldItemRepository;
    public ColdDataService(ColdItemRepository coldItemRepository) {
        this.coldItemRepository = coldItemRepository;   // Constructor injection of the repository
    }
    @PreAuthorize("hasRole('ADMIN')")
    public ColdDataResponse addColdData(ColdItem coldItem) {
        ColdItem savedItem = coldItemRepository.save(coldItem);
        return new ColdDataResponse(savedItem);
    }
   @PreAuthorize("hasRole('ADMIN')")
    public List<ColdDataResponse> getAllColdData() {
        List<ColdItem> coldItems = coldItemRepository.findAll();
        return coldItems.stream().map(ColdDataResponse::new).toList();
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public List<ColdDataResponse> getColdData(Long userId) {
        if (!coldItemRepository.existsByUser_Id(userId)) {
            throw new IllegalArgumentException("No cold data found for the specified user.");
        }
        List<ColdItem> coldItems = coldItemRepository.findByUser_Id(userId);
        return coldItems.stream().map(ColdDataResponse::new).toList();
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteColdData(Long id) {
        if (!coldItemRepository.existsById(id)) {
            throw new IllegalArgumentException("Cold data item not found.");
        }
        coldItemRepository.deleteById(id);
    }
    public ColdDataResponse updateColdData(Long id, ColdItem updatedItem) {
        ColdItem existingItem = coldItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cold data item not found."));
        existingItem.setData(updatedItem.getData());
        return new ColdDataResponse(coldItemRepository.save(existingItem));
    }

    private ColdDataResponse toColdDataResponse(ColdItem item) {
        return new ColdDataResponse(item);
    }
}