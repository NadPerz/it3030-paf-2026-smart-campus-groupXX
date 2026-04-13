package com.smartcampus.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for notification responses.
 * Member 4 — Notification management.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private String id;
    private String title;
    private String message;
    private String type;
    private String referenceId;

    // @JsonProperty forces Jackson to serialize/deserialize as "isRead"
    // Without this, Lombok's isRead() getter causes Jackson to use "read" instead
    @JsonProperty("isRead")
    private boolean isRead;

    private LocalDateTime createdAt;
}