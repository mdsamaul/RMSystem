package com.rms.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rms.backend.entity.MenuCategory;

import java.util.List;
@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
    List<MenuCategory> findByIsActiveTrueOrderBySortOrderAsc();
    boolean existsByName(String name);
}
