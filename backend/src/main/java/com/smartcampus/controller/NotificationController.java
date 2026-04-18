package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/**
 * Notification REST controller — Member 4.
 * Base path: /api/notifications
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // ─────────────────────────────────────────────
    // REAL-TIME SSE STREAM
    // ─────────────────────────────────────────────

    /**
     * GET /api/notifications/stream
     * Opens a persistent SSE connection — frontend receives new notifications
     * instantly.
     * Uses standard JWT auth (Authorization header) via fetch + ReadableStream on
     * the frontend.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(Authentication auth) {
        String userId = resolveUserId(auth);
        return notificationService.createEmitter(userId);
    }

    // ─────────────────────────────────────────────
    // REST ENDPOINTS
    // ─────────────────────────────────────────────

    /** GET /api/notifications — Get all notifications for current user */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(Authentication auth) {
        String userId = resolveUserId(auth);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    /** GET /api/notifications/unread-count — Unread badge count for bell icon */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        String userId = resolveUserId(auth);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /** PUT /api/notifications/{id}/read — Mark a single notification as read */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable String id,
            Authentication auth) {
        String userId = resolveUserId(auth);
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    /** PUT /api/notifications/read-all — Mark all notifications as read */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        String userId = resolveUserId(auth);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /** DELETE /api/notifications/{id} — Delete a notification */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable String id,
            Authentication auth) {
        String userId = resolveUserId(auth);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────
    // Helper — resolves JWT email → userId
    // ─────────────────────────────────────────────

    private String resolveUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return user.getId();
    }
}