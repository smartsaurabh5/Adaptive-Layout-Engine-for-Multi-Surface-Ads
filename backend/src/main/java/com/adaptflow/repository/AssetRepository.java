package com.adaptflow.repository;

import com.adaptflow.model.Asset;
import com.adaptflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, String> {
    List<Asset> findAllByOrderByCreatedAtDesc();
    List<Asset> findByOwnerOrderByCreatedAtDesc(User owner);
}
