package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.enums.UserRole;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

        private final NotificationRepository notificationRepository;
        private final UserRepository userRepository;

        // ─────────────────────────────────────────────
        // SSE EMITTER MANAGEMENT
        // ─────────────────────────────────────────────

        /** One user can have multiple open browser tabs — store all their emitters */
        private final Map<String, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

        /**
         * Called by NotificationController to open a real-time SSE stream for a user
         */
        public SseEmitter createEmitter(String userId) {
                SseEmitter emitter = new SseEmitter(0L); // 0L = no timeout
                CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.computeIfAbsent(userId,
                                k -> new CopyOnWriteArrayList<>());
                userEmitters.add(emitter);

                emitter.onCompletion(() -> userEmitters.remove(emitter));
                emitter.onTimeout(() -> userEmitters.remove(emitter));
                emitter.onError(e -> userEmitters.remove(emitter));

                return emitter;
        }

        /** Push a notification DTO to all open tabs of a user instantly */
        private void pushToUser(String userId, NotificationDTO dto) {
                CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.get(userId);
                if (userEmitters == null || userEmitters.isEmpty())
                        return;

                List<SseEmitter> dead = new ArrayList<>();
                for (SseEmitter emitter : userEmitters) {
                        try {
                                emitter.send(SseEmitter.event()
                                                .name("notification")
                                                .data(dto));
                        } catch (IOException e) {
                                dead.add(emitter);
                        }
                }
                userEmitters.removeAll(dead);
        }

        // ─────────────────────────────────────────────
        // CORE CRUD OPERATIONS
        // ─────────────────────────────────────────────

        /**
         * Creates and persists a notification, then pushes it via SSE in real time.
         * Called internally — never exposed directly via HTTP.
         */
        public void createNotification(String userId, String title, String message,
                        String type, String referenceId) {
                Notification notification = Notification.builder()
                                .userId(userId)
                                .title(title)
                                .message(message)
                                .type(type)
                                .referenceId(referenceId)
                                .isRead(false)
                                .build();
                Notification saved = notificationRepository.save(notification);
                pushToUser(userId, toDTO(saved)); // ← real-time push to browser
        }

        /** Get all notifications for a user, newest first */
        public List<NotificationDTO> getNotificationsForUser(String userId) {
                return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                                .stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }

        /** Mark a single notification as read — verifies ownership */
        public NotificationDTO markAsRead(String notificationId, String userId) {
                Notification notification = findAndVerifyOwnership(notificationId, userId);
                notification.setRead(true);
                return toDTO(notificationRepository.save(notification));
        }

        /** Mark all notifications as read for a user */
        public void markAllAsRead(String userId) {
                List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
                unread.forEach(n -> n.setRead(true));
                notificationRepository.saveAll(unread);
        }

        /** Delete a notification — verifies ownership */
        public void deleteNotification(String notificationId, String userId) {
                findAndVerifyOwnership(notificationId, userId);
                notificationRepository.deleteById(notificationId);
        }

        /** Get count of unread notifications */
        public long getUnreadCount(String userId) {
                return notificationRepository.countByUserIdAndIsReadFalse(userId);
        }

        // ─────────────────────────────────────────────
        // USER MANAGEMENT NOTIFICATION TRIGGERS
        // ─────────────────────────────────────────────

        public void notifyNewUserPending(User user) {
                createNotification(
                                user.getId(),
                                "Account Pending Approval",
                                "Welcome, " + user.getName()
                                                + "! Your account has been submitted and is awaiting admin approval. "
                                                + "You'll be notified once your account is activated.",
                                "ACCOUNT_PENDING",
                                user.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "New User Pending Approval",
                                        "A new user has registered and is awaiting approval: "
                                                        + user.getName() + " (" + user.getEmail() + ")",
                                        "NEW_USER_PENDING",
                                        user.getId());
                }
        }

        public void notifyAccountApproved(User user) {
                createNotification(
                                user.getId(),
                                "Account Approved ✓",
                                "Great news! Your account has been approved. You now have full access to Smart Campus Hub.",
                                "ACCOUNT_APPROVED",
                                user.getId());
        }

        public void notifyAccountSuspended(User user) {
                createNotification(
                                user.getId(),
                                "Account Suspended",
                                "Your account has been suspended. Please contact an administrator if you believe this is a mistake.",
                                "ACCOUNT_SUSPENDED",
                                user.getId());
        }

        public void notifyAccountReactivated(User user) {
                createNotification(
                                user.getId(),
                                "Account Reactivated ✓",
                                "Your account has been reactivated. You can now log in and access Smart Campus Hub.",
                                "ACCOUNT_REACTIVATED",
                                user.getId());
        }

        public void notifyProfileNameUpdated(User user, String oldName) {
                createNotification(
                                user.getId(),
                                "Profile Updated",
                                "Your display name has been updated to \"" + user.getName() + "\".",
                                "PROFILE_UPDATED",
                                user.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "User Profile Updated",
                                        "User " + user.getEmail() + " changed their display name from \""
                                                        + oldName + "\" to \"" + user.getName() + "\".",
                                        "USER_PROFILE_UPDATED",
                                        user.getId());
                }
        }

        public void notifyRoleChanged(User user, UserRole oldRole, UserRole newRole) {
                createNotification(
                                user.getId(),
                                "Account Role Updated",
                                "Your account role has been changed from " + oldRole.name()
                                                + " to " + newRole.name() + ".",
                                "ROLE_CHANGED",
                                user.getId());
        }

        // ─────────────────────────────────────────────
        // BOOKING NOTIFICATION TRIGGERS (for Member 2)
        // ─────────────────────────────────────────────

        public void notifyBookingApproved(String userId, String bookingId, String resourceName) {
                createNotification(
                                userId,
                                "Booking Approved ✓",
                                "Your booking for \"" + resourceName + "\" has been approved.",
                                "BOOKING_APPROVED",
                                bookingId);
        }

        public void notifyBookingRejected(String userId, String bookingId, String resourceName) {
                createNotification(
                                userId,
                                "Booking Rejected",
                                "Your booking for \"" + resourceName
                                                + "\" has been rejected. Please contact admin for details.",
                                "BOOKING_REJECTED",
                                bookingId);
        }

        /** Overload — called by Member 2's BookingService with a Booking object */
        public void notifyBookingApproved(String userId, Booking booking) {
                notifyBookingApproved(
                                userId,
                                booking.getId(),
                                booking.getResourceId() != null ? booking.getResourceId() : "your resource");
        }

        /** Overload — called by Member 2's BookingService with a Booking object */
        public void notifyBookingRejected(String userId, Booking booking) {
                notifyBookingRejected(
                                userId,
                                booking.getId(),
                                booking.getResourceId() != null ? booking.getResourceId() : "your resource");
        }

        // ─────────────────────────────────────────────
        // TICKET NOTIFICATION TRIGGERS (for Member 3)
        // ─────────────────────────────────────────────

        public void notifyTicketStatusChanged(String userId, String ticketId, String newStatus) {
                createNotification(
                                userId,
                                "Ticket Status Updated",
                                "Your ticket status has been updated to: " + newStatus + ".",
                                "TICKET_STATUS_CHANGED",
                                ticketId);
        }

        public void notifyNewTicketComment(String userId, String ticketId, String commenterName) {
                createNotification(
                                userId,
                                "New Comment on Your Ticket",
                                commenterName + " added a comment on your ticket.",
                                "TICKET_COMMENT",
                                ticketId);
        }

        // ─────────────────────────────────────────────
        // RESOURCE NOTIFICATION TRIGGERS (for Member 1)
        // ─────────────────────────────────────────────

        public void notifyResourceOutOfService(String userId, String resourceId, String resourceName) {
                createNotification(
                                userId,
                                "Resource Out of Service",
                                "\"" + resourceName
                                                + "\" is currently out of service. Your related booking may be affected.",
                                "RESOURCE_OUT_OF_SERVICE",
                                resourceId);
        }

        // ─────────────────────────────────────────────
        // HELPERS
        // ─────────────────────────────────────────────

        private Notification findAndVerifyOwnership(String notificationId, String userId) {
                Notification notification = notificationRepository.findById(notificationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Notification not found: " + notificationId));
                if (!notification.getUserId().equals(userId)) {
                        throw new UnauthorizedException("You do not have permission to access this notification.");
                }
                return notification;
        }

        private NotificationDTO toDTO(Notification notification) {
                return NotificationDTO.builder()
                                .id(notification.getId())
                                .title(notification.getTitle())
                                .message(notification.getMessage())
                                .type(notification.getType())
                                .referenceId(notification.getReferenceId())
                                .isRead(notification.isRead())
                                .createdAt(notification.getCreatedAt())
                                .build();
        }
}