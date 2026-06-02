package com.rms.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.rms.backend.entity.Order;

import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Order> findByStatusOrderByCreatedAtAsc(Order.OrderStatus status);
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status='CLOSED' AND o.createdAt BETWEEN :start AND :end")
    Double getTotalRevenueBetween(LocalDateTime start, LocalDateTime end);
    @Query("SELECT oi.menuItem.name, SUM(oi.quantity) as total FROM OrderItem oi GROUP BY oi.menuItem.id ORDER BY total DESC")
    List<Object[]> findTopSellingItems();
}
