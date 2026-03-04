package com.smartcampus.dto;

import lombok.*;

/**
 * DTO for approving or rejecting a booking.
 * Member 2 — Booking workflow (admin approval).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingApprovalDTO {

    /** Required when rejecting a booking — explains the reason for rejection. */
    private String reason;
}
