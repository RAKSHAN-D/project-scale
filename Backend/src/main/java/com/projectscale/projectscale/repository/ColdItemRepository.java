package com.projectscale.projectscale.repository;

import com.projectscale.projectscale.entity.ColdItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ColdItemRepository extends JpaRepository<ColdItem, Long> {
    List<ColdItem> findByUser_Id(Long userId);
}