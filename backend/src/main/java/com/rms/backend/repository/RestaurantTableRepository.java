package com.rms.backend.repository;

import com.rms.backend.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findByStatus(RestaurantTable.TableStatus status);

    boolean existsByTableNumber(String tableNumber);
}
