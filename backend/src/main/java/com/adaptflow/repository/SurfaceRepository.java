package com.adaptflow.repository;

import com.adaptflow.model.Surface;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurfaceRepository extends JpaRepository<Surface, String> {
    List<Surface> findAllByOrderByNameAsc();
}
