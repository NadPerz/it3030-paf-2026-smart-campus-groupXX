package com.smartcampus.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for ticket comment responses.
 * Member 3 — Incident ticket comments.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCommentDTO {

    private Long id;
    private Long userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
}
