package com.smartcampus.controller;

import com.smartcampus.dto.BookingApprovalDTO;
import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Booking REST controller — Member 2 responsibility.
 * Base path: /api/bookings
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /** POST /api/bookings — Submit a new booking request */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO dto) {
        // TODO (Member 2): Extract userId from SecurityContext, call bookingService.createBooking(userId, dto)
        return ResponseEntity.ok().build();
    }

    /** GET /api/bookings/my — Get current user's bookings */
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings() {
        // TODO (Member 2): Extract userId from SecurityContext, call bookingService.getMyBookings(userId)
        return ResponseEntity.ok().build();
    }

    /** GET /api/bookings — Get all bookings (admin only) */
    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        // TODO (Member 2): return ResponseEntity.ok(bookingService.getAllBookings());
        return ResponseEntity.ok().build();
    }

    /** GET /api/bookings/{id} — Get booking by ID */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        // TODO (Member 2): return ResponseEntity.ok(bookingService.getBookingById(id));
        return ResponseEntity.ok().build();
    }

    /** PUT /api/bookings/{id}/approve — Approve a booking (admin only) */
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable Long id,
                                                              @RequestBody BookingApprovalDTO dto) {
        // TODO (Member 2): return ResponseEntity.ok(bookingService.approveBooking(id, dto));
        return ResponseEntity.ok().build();
    }

    /** PUT /api/bookings/{id}/reject — Reject a booking (admin only) */
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponseDTO> rejectBooking(@PathVariable Long id,
                                                             @Valid @RequestBody BookingApprovalDTO dto) {
        // TODO (Member 2): return ResponseEntity.ok(bookingService.rejectBooking(id, dto));
        return ResponseEntity.ok().build();
    }

    /** PATCH /api/bookings/{id}/cancel — Cancel a booking */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        // TODO (Member 2): Extract userId, call bookingService.cancelBooking(id, userId)
        return ResponseEntity.ok().build();
    }

    /** DELETE /api/bookings/{id} — Delete a booking (admin only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        // TODO (Member 2): bookingService.deleteBooking(id); return ResponseEntity.noContent().build();
        return ResponseEntity.noContent().build();
    }

    /** GET /api/bookings/{id}/qr — Get QR code for a booking */
    @GetMapping("/{id}/qr")
    public ResponseEntity<String> getQRCode(@PathVariable Long id) {
        // TODO (Member 2): return ResponseEntity.ok(bookingService.getQRCode(id));
        return ResponseEntity.ok().build();
    }

    /** POST /api/bookings/check-in — QR code check-in */
    @PostMapping("/check-in")
    public ResponseEntity<BookingResponseDTO> checkIn(@RequestParam String token) {
        // TODO (Member 2): return ResponseEntity.ok(bookingService.checkIn(token));
        return ResponseEntity.ok().build();
    }
}
