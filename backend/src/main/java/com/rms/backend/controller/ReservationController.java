package com.rms.backend.controller;

import com.rms.backend.dto.request.ReservationRequest;
import com.rms.backend.dto.response.ApiResponse;
import com.rms.backend.dto.response.ReservationResponse;
import com.rms.backend.entity.Reservation;
import com.rms.backend.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@SecurityRequirement(name="bearerAuth")
@Tag(name="Reservations", description="Table reservation management")
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    @Operation(summary="Create a reservation")
    public ResponseEntity<ApiResponse<ReservationResponse>> create(
            @Valid @RequestBody ReservationRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Reservation created",
            reservationService.createReservation(req, user.getUsername())));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary="Get all reservations (Admin/Staff only)")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Reservations fetched", reservationService.getAllReservations()));
    }

    @GetMapping("/my")
    @Operation(summary="Get my reservations")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getMyReservations(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("My reservations", reservationService.getMyReservations(user.getUsername())));
    }

    @GetMapping("/{id}")
    @Operation(summary="Get reservation by ID")
    public ResponseEntity<ApiResponse<ReservationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Reservation fetched", reservationService.getById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary="Update reservation status (Admin/Staff only)")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateStatus(
            @PathVariable Long id, @RequestParam Reservation.ReservationStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", reservationService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary="Cancel a reservation")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        reservationService.cancelReservation(id, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled"));
    }
}
