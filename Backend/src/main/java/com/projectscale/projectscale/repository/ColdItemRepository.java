package com.projectscale.projectscale.repository;

import com.projectscale.projectscale.entity.ColdItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ColdItemRepository extends JpaRepository<ColdItem, Long> {
    List<ColdItem> findByUser_Id(Long userId);
}

/* @PreAuthorize("hasRole('ADMIN')")
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
*/