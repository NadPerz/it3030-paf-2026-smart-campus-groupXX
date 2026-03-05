package com.smartcampus.repository;

import com.smartcampus.enums.BookingStatus;
import com.smartcampus.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Booking repository — Member 2 (Booking workflow + conflict checking).
 *
 * IMPORTANT: The existsConflictingBooking query is critical for preventing
 * double-bookings. It checks overlapping time slots on the same resource and date.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Detects time-slot conflicts for a resource on a given date.
     *
     * Two bookings conflict when:
     *   new.startTime < existing.endTime  AND  new.endTime > existing.startTime
     *
     * Only PENDING and APPROVED bookings block the slot.
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
           "FROM Booking b " +
           "WHERE b.resource.id = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime")
    boolean existsConflictingBooking(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate date);
}
