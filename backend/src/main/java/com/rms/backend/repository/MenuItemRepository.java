package com.rms.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.rms.backend.entity.MenuItem;

import java.util.List;
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategoryIdAndIsAvailableTrue(Long categoryId);
    List<MenuItem> findByIsAvailableTrue();
    @Query("SELECT m FROM MenuItem m WHERE m.isAvailable=true AND (LOWER(m.name) LIKE LOWER(CONCAT('%',:keyword,'%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%',:keyword,'%')))")
    List<MenuItem> searchByKeyword(String keyword);
}

