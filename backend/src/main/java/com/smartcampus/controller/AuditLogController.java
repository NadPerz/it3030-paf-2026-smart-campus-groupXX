package com.smartcampus.controller;

import com.smartcampus.enums.AuditAction;
import com.smartcampus.model.AuditLog;
import com.smartcampus.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Audit log controller — Member 4 responsibility.
 * Base path: /api/audit-logs
 */
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    /** GET /api/audit-logs — Get all logs (ADMIN only) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    /** GET /api/audit-logs/action/{action} — Filter by action */
    @GetMapping("/action/{action}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getByAction(@PathVariable AuditAction action) {
        return ResponseEntity.ok(auditLogService.getLogsByAction(action));
    }

    /** GET /api/audit-logs/user/{email} — Filter by user */
    @GetMapping("/user/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getByUser(@PathVariable String email) {
        return ResponseEntity.ok(auditLogService.getLogsByUser(email));
    }
}