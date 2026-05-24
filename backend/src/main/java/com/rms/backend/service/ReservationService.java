package com.rms.backend.service;

import com.rms.backend.dto.request.ReservationRequest;
import com.rms.backend.dto.response.ReservationResponse;
import com.rms.backend.entity.Reservation;
import java.util.List;
public interface ReservationService {
    ReservationResponse createReservation(ReservationRequest req, String customerEmail);
    ReservationResponse getById(Long id);
    List<ReservationResponse> getAllReservations();
    List<ReservationResponse> getMyReservations(String customerEmail);
    ReservationResponse updateStatus(Long id, Reservation.ReservationStatus status);
    void cancelReservation(Long id, String userEmail);
}
