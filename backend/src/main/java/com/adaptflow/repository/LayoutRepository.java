package com.adaptflow.repository;

import com.adaptflow.model.Layout;
import com.adaptflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LayoutRepository extends JpaRepository<Layout, String> {
    List<Layout> findAllByOrderByUpdatedAtDesc();
    List<Layout> findByOwnerOrderByUpdatedAtDesc(User owner);
    Optional<Layout> findByIdAndOwner(String id, User owner);
}
