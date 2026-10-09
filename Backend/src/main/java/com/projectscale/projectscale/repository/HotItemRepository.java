package com.projectscale.projectscale.repository;

import com.projectscale.projectscale.entity.HotItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HotItemRepository extends JpaRepository<HotItem, Long> {
    Optional<HotItem> findByItemKey(String itemKey);
    boolean existsByItemKey(String itemKey);
    List<HotItem> findByUser_Id(Long userId);
}
