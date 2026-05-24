package com.rms.backend.repository;

import com.rms.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByCustomerIdOrderByReservedAtDesc(Long customerId);
    @Query("SELECT r FROM Reservation r WHERE r.table.id=:tableId AND r.status NOT IN ('COMPLETED','CANCELLED') AND r.reservedAt BETWEEN :start AND :end")
    List<Reservation> findConflictingReservations(Long tableId, LocalDateTime start, LocalDateTime end);
    List<Reservation> findByStatusOrderByReservedAtAsc(Reservation.ReservationStatus status);
}
