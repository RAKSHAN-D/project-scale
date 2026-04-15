package com.projectscale.projectscale.repository;

import com.projectscale.projectscale.entity.StaticAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StaticAssetRepository extends JpaRepository<StaticAsset, Long> {
    Optional<StaticAsset> findByFilename(String filename);
}
