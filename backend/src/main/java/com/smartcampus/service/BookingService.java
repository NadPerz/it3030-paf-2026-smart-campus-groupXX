package com.smartcampus.service;

import com.smartcampus.dto.BookingApprovalDTO;
import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Booking service — Member 2 responsibility.
 *
 * TODO (Member 2): Implement the full booking workflow:
 *
 * STATE MACHINE:
 *   PENDING ──► APPROVED  (admin approves → generate QR code via QRCodeService)
 *   PENDING ──► REJECTED  (admin rejects → store rejection reason)
 *   APPROVED ──► CANCELLED (user or admin cancels)
 *
 * CONFLICT DETECTION ALGORITHM:
 *   Before creating or approving a booking, call:
 *   bookingRepository.existsConflictingBooking(resourceId, date, startTime, endTime)
 *
 *   Two time slots conflict when:
 *     newStart < existingEnd  AND  newEnd > existingStart
 *
 *   Only PENDING and APPROVED bookings block a slot.
 *   If a conflict exists, throw BookingConflictException.
 *
 * QR CHECK-IN FLOW (innovation):
 *   1. On booking approval, call qrCodeService.generateQRCode(bookingId) → base64 PNG
 *   2. Store result in booking.qrCode field
 *   3. On check-in, call qrCodeService.verifyQRCode(token) to validate
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final QRCodeService qrCodeService;
    private final NotificationService notificationService;

    public BookingResponseDTO createBooking(Long userId, BookingRequestDTO dto) {
        // TODO (Member 2): Implement — check conflicts, create booking with PENDING status
        throw new UnsupportedOperationException("TODO: Member 2 — implement createBooking()");
    }

    public List<BookingResponseDTO> getMyBookings(Long userId) {
        // TODO (Member 2): Implement
        throw new UnsupportedOperationException("TODO: Member 2 — implement getMyBookings()");
    }

    public List<BookingResponseDTO> getAllBookings() {
        // TODO (Member 2): Implement (admin only)
        throw new UnsupportedOperationException("TODO: Member 2 — implement getAllBookings()");
    }

    public BookingResponseDTO getBookingById(Long id) {
        // TODO (Member 2): Implement
        throw new UnsupportedOperationException("TODO: Member 2 — implement getBookingById()");
    }

    public BookingResponseDTO approveBooking(Long id, BookingApprovalDTO dto) {
        // TODO (Member 2): Implement — set APPROVED, generate QR code, notify user
        throw new UnsupportedOperationException("TODO: Member 2 — implement approveBooking()");
    }

    public BookingResponseDTO rejectBooking(Long id, BookingApprovalDTO dto) {
        // TODO (Member 2): Implement — set REJECTED, store reason, notify user
        throw new UnsupportedOperationException("TODO: Member 2 — implement rejectBooking()");
    }

    public BookingResponseDTO cancelBooking(Long id, Long userId) {
        // TODO (Member 2): Implement — validate ownership, set CANCELLED
        throw new UnsupportedOperationException("TODO: Member 2 — implement cancelBooking()");
    }

    public void deleteBooking(Long id) {
        // TODO (Member 2): Implement (admin only)
        throw new UnsupportedOperationException("TODO: Member 2 — implement deleteBooking()");
    }

    public String getQRCode(Long bookingId) {
        // TODO (Member 2): Implement — return the stored QR code string
        throw new UnsupportedOperationException("TODO: Member 2 — implement getQRCode()");
    }

    public BookingResponseDTO checkIn(String qrToken) {
        // TODO (Member 2): Implement — verify QR token, mark booking as checked in
        throw new UnsupportedOperationException("TODO: Member 2 — implement checkIn()");
    }
}
