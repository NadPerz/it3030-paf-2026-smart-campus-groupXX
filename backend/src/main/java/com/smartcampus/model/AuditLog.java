package com.smartcampus.model;

import com.smartcampus.enums.AuditAction;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Audit log model — tracks all important actions.
 * Member 4 responsibility.
 */
@Document(collection = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    private String id;

    private AuditAction action;

    // Who performed the action
    private String performedBy;

    // Who was affected
    private String targetUser;

    // Extra details e.g. "Role changed from USER to ADMIN"
    private String details;

    // IP address of the request
    private String ipAddress;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}