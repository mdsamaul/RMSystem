package com.rms.backend.service.impl;

import com.rms.backend.dto.request.ReservationRequest;
import com.rms.backend.dto.response.ReservationResponse;
import com.rms.backend.entity.Reservation;
import com.rms.backend.entity.RestaurantTable;
import com.rms.backend.entity.User;
import com.rms.backend.exception.BadRequestException;
import com.rms.backend.exception.ResourceNotFoundException;
import com.rms.backend.repository.ReservationRepository;
import com.rms.backend.repository.RestaurantTableRepository;
import com.rms.backend.repository.UserRepository;
import com.rms.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class ReservationServiceImpl implements ReservationService {
    private final ReservationRepository reservationRepo;
    private final RestaurantTableRepository tableRepo;
    private final UserRepository userRepo;

    @Override public ReservationResponse createReservation(ReservationRequest req, String customerEmail) {
        User customer = userRepo.findByEmail(customerEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        RestaurantTable table = tableRepo.findById(req.getTableId())
            .orElseThrow(() -> new ResourceNotFoundException("Table not found: " + req.getTableId()));
        if (table.getCapacity() < req.getPartySize())
            throw new BadRequestException("Table capacity (" + table.getCapacity() + ") is less than party size");
        List<Reservation> conflicts = reservationRepo.findConflictingReservations(
            req.getTableId(), req.getReservedAt().minusHours(2), req.getReservedAt().plusHours(2));
        if (!conflicts.isEmpty())
            throw new BadRequestException("Table is already reserved at this time");
        Reservation r = Reservation.builder().customer(customer).table(table)
            .partySize(req.getPartySize()).reservedAt(req.getReservedAt()).notes(req.getNotes()).build();
        return ReservationResponse.from(reservationRepo.save(r));
    }

    @Override @Transactional(readOnly=true)
    public ReservationResponse getById(Long id) {
        return ReservationResponse.from(reservationRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id))); }

    @Override @Transactional(readOnly=true)
    public List<ReservationResponse> getAllReservations() {
        return reservationRepo.findAll().stream().map(ReservationResponse::from).collect(Collectors.toList()); }

    @Override @Transactional(readOnly=true)
    public List<ReservationResponse> getMyReservations(String customerEmail) {
        User customer = userRepo.findByEmail(customerEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reservationRepo.findByCustomerIdOrderByReservedAtDesc(customer.getId())
            .stream().map(ReservationResponse::from).collect(Collectors.toList()); }

    @Override public ReservationResponse updateStatus(Long id, Reservation.ReservationStatus status) {
        Reservation r = reservationRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
        r.setStatus(status);
        if (status == Reservation.ReservationStatus.SEATED && r.getTable() != null) {
            r.getTable().setStatus(RestaurantTable.TableStatus.OCCUPIED);
            tableRepo.save(r.getTable());
        }
        return ReservationResponse.from(reservationRepo.save(r));
    }

    @Override public void cancelReservation(Long id, String userEmail) {
        Reservation r = reservationRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
        r.setStatus(Reservation.ReservationStatus.CANCELLED);
        reservationRepo.save(r);
    }
}
