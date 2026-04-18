package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.enums.UserRole;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

        private final NotificationRepository notificationRepository;
        private final UserRepository userRepository;
        private final EmailService emailService;

        // ─────────────────────────────────────────────
        // SSE EMITTER MANAGEMENT
        // ─────────────────────────────────────────────

        private final Map<String, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

        public SseEmitter createEmitter(String userId) {
                SseEmitter emitter = new SseEmitter(0L);
                CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.computeIfAbsent(userId,
                                k -> new CopyOnWriteArrayList<>());
                userEmitters.add(emitter);

                emitter.onCompletion(() -> userEmitters.remove(emitter));
                emitter.onTimeout(() -> userEmitters.remove(emitter));
                emitter.onError(e -> userEmitters.remove(emitter));

                return emitter;
        }

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
                pushToUser(userId, toDTO(saved));
        }

        public List<NotificationDTO> getNotificationsForUser(String userId) {
                return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                                .stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }

        public NotificationDTO markAsRead(String notificationId, String userId) {
                Notification notification = findAndVerifyOwnership(notificationId, userId);
                notification.setRead(true);
                return toDTO(notificationRepository.save(notification));
        }

        public void markAllAsRead(String userId) {
                List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
                unread.forEach(n -> n.setRead(true));
                notificationRepository.saveAll(unread);
        }

        public void deleteNotification(String notificationId, String userId) {
                findAndVerifyOwnership(notificationId, userId);
                notificationRepository.deleteById(notificationId);
        }

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

                // Email notification to user
                try {
                        emailService.sendEmail(
                                        user.getEmail(),
                                        "Account Pending Approval — SmartCampus",
                                        "Hi " + user.getName() + ",\n\n"
                                                        + "Your account has been submitted and is awaiting admin approval. "
                                                        + "You'll be notified once your account is activated.\n\n"
                                                        + "SmartCampus Team");
                } catch (Exception e) {
                        log.warn("Failed to send account pending email to {}: {}", user.getEmail(), e.getMessage());
                }
        }

        public void notifyAccountApproved(User user) {
                createNotification(
                                user.getId(),
                                "Account Approved ✓",
                                "Great news! Your account has been approved. You now have full access to Smart Campus Hub.",
                                "ACCOUNT_APPROVED",
                                user.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "User Account Approved",
                                        "The account for " + user.getName() + " (" + user.getEmail()
                                                        + ") has been approved.",
                                        "ACCOUNT_APPROVED",
                                        user.getId());
                }

                // Email notification to user
                try {
                        emailService.sendEmail(
                                        user.getEmail(),
                                        "Account Approved — SmartCampus",
                                        "Hi " + user.getName() + ",\n\n"
                                                        + "Great news! Your account has been approved. "
                                                        + "You now have full access to Smart Campus Hub.\n\n"
                                                        + "SmartCampus Team");
                } catch (Exception e) {
                        log.warn("Failed to send account approved email to {}: {}", user.getEmail(), e.getMessage());
                }
        }

        public void notifyAccountSuspended(User user) {
                createNotification(
                                user.getId(),
                                "Account Suspended",
                                "Your account has been suspended. Please contact an administrator if you believe this is a mistake.",
                                "ACCOUNT_SUSPENDED",
                                user.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "User Account Suspended",
                                        "The account for " + user.getName() + " (" + user.getEmail()
                                                        + ") has been suspended.",
                                        "ACCOUNT_SUSPENDED",
                                        user.getId());
                }

                // Email notification to user
                try {
                        emailService.sendEmail(
                                        user.getEmail(),
                                        "Account Suspended — SmartCampus",
                                        "Hi " + user.getName() + ",\n\n"
                                                        + "Your account has been suspended. "
                                                        + "Please contact an administrator if you believe this is a mistake.\n\n"
                                                        + "SmartCampus Team");
                } catch (Exception e) {
                        log.warn("Failed to send account suspended email to {}: {}", user.getEmail(), e.getMessage());
                }
        }

        public void notifyAccountReactivated(User user) {
                createNotification(
                                user.getId(),
                                "Account Reactivated ✓",
                                "Your account has been reactivated. You can now log in and access Smart Campus Hub.",
                                "ACCOUNT_REACTIVATED",
                                user.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "User Account Reactivated",
                                        "The account for " + user.getName() + " (" + user.getEmail()
                                                        + ") has been reactivated.",
                                        "ACCOUNT_REACTIVATED",
                                        user.getId());
                }

                // Email notification to user
                try {
                        emailService.sendEmail(
                                        user.getEmail(),
                                        "Account Reactivated — SmartCampus",
                                        "Hi " + user.getName() + ",\n\n"
                                                        + "Your account has been reactivated. "
                                                        + "You can now log in and access Smart Campus Hub.\n\n"
                                                        + "SmartCampus Team");
                } catch (Exception e) {
                        log.warn("Failed to send account reactivated email to {}: {}", user.getEmail(), e.getMessage());
                }
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

                // Email notification to user
                try {
                        emailService.sendEmail(
                                        user.getEmail(),
                                        "Profile Updated — SmartCampus",
                                        "Hi " + user.getName() + ",\n\n"
                                                        + "Your display name has been updated to \"" + user.getName()
                                                        + "\".\n\n"
                                                        + "If you did not make this change, please contact an administrator.\n\n"
                                                        + "SmartCampus Team");
                } catch (Exception e) {
                        log.warn("Failed to send profile updated email to {}: {}", user.getEmail(), e.getMessage());
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

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "User Role Changed",
                                        "The role for " + user.getName() + " (" + user.getEmail()
                                                        + ") has been changed from "
                                                        + oldRole.name() + " to " + newRole.name() + ".",
                                        "ROLE_CHANGED",
                                        user.getId());
                }

                // Email notification to user
                try {
                        emailService.sendEmail(
                                        user.getEmail(),
                                        "Account Role Updated — SmartCampus",
                                        "Hi " + user.getName() + ",\n\n"
                                                        + "Your account role has been changed from " + oldRole.name()
                                                        + " to " + newRole.name() + ".\n\n"
                                                        + "If you have any questions, please contact an administrator.\n\n"
                                                        + "SmartCampus Team");
                } catch (Exception e) {
                        log.warn("Failed to send role changed email to {}: {}", user.getEmail(), e.getMessage());
                }
        }

        // ─────────────────────────────────────────────
        // BOOKING NOTIFICATION TRIGGERS
        // ─────────────────────────────────────────────

        public void notifyBookingApproved(String userId, String bookingId, String resourceName) {
                createNotification(
                                userId,
                                "Booking Approved ✓",
                                "Your booking for \"" + resourceName + "\" has been approved.",
                                "BOOKING_APPROVED",
                                bookingId);

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "Booking Approved",
                                        "The booking for \"" + resourceName + "\" by user " + userId
                                                        + " has been approved.",
                                        "BOOKING_APPROVED",
                                        bookingId);
                }

                // Email notification
                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "Booking Approved — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + "Your booking for \"" + resourceName
                                                                + "\" has been approved.\n\n"
                                                                + "You can view your booking details in the SmartCampus app.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send booking approved email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        public void notifyBookingRejected(String userId, String bookingId, String resourceName) {
                createNotification(
                                userId,
                                "Booking Rejected",
                                "Your booking for \"" + resourceName
                                                + "\" has been rejected. Please contact admin for details.",
                                "BOOKING_REJECTED",
                                bookingId);

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "Booking Rejected",
                                        "The booking for \"" + resourceName + "\" by user " + userId
                                                        + " has been rejected.",
                                        "BOOKING_REJECTED",
                                        bookingId);
                }

                // Email notification
                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "Booking Rejected — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + "Unfortunately, your booking for \"" + resourceName
                                                                + "\" has been rejected.\n\n"
                                                                + "Please contact an administrator for more details.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send booking rejected email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ── BUG FIX: was using getResourceId() instead of getResourceName() ──
        public void notifyBookingApproved(String userId, Booking booking) {
                notifyBookingApproved(
                                userId,
                                booking.getId(),
                                booking.getResourceName() != null ? booking.getResourceName() : "your resource");
        }

        public void notifyBookingRejected(String userId, Booking booking) {
                notifyBookingRejected(
                                userId,
                                booking.getId(),
                                booking.getResourceName() != null ? booking.getResourceName() : "your resource");
        }

        // ── notifyBookingCreated ─────────────────────────────────────────────
        public void notifyBookingCreated(String userId, Booking booking) {
                createNotification(
                                userId,
                                "Booking Submitted",
                                "Your booking for \"" + booking.getResourceName()
                                                + "\" has been submitted and is pending approval.",
                                "BOOKING_CREATED",
                                booking.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "New Booking Pending Approval",
                                        "A new booking for \"" + booking.getResourceName()
                                                        + "\" has been submitted by user " + userId
                                                        + " and is awaiting approval.",
                                        "BOOKING_CREATED",
                                        booking.getId());
                }

                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "Booking Submitted — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + "Your booking for \"" + booking.getResourceName()
                                                                + "\" on " + booking.getBookingDate()
                                                                + " (" + booking.getStartTime() + " – "
                                                                + booking.getEndTime()
                                                                + ") has been submitted.\n\n"
                                                                + "You will be notified once it is reviewed by an admin.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send booking created email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ── notifyBookingCancelled ───────────────────────────────────────────
        public void notifyBookingCancelled(String userId, Booking booking) {
                createNotification(
                                userId,
                                "Booking Cancelled",
                                "Your booking for \"" + booking.getResourceName()
                                                + "\" has been cancelled by an admin.",
                                "BOOKING_CANCELLED",
                                booking.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "Booking Cancelled",
                                        "The booking for \"" + booking.getResourceName() + "\" by user " + userId
                                                        + " has been cancelled.",
                                        "BOOKING_CANCELLED",
                                        booking.getId());
                }

                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "Booking Cancelled — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + "Your booking for \"" + booking.getResourceName()
                                                                + "\" on " + booking.getBookingDate()
                                                                + " has been cancelled by an administrator.\n\n"
                                                                + "Please contact admin if you have any questions.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send booking cancelled email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ─────────────────────────────────────────────
        // TICKET NOTIFICATION TRIGGERS
        // ─────────────────────────────────────────────

        // ── notifyTicketCreated ──────────────────────────────────────────────
        public void notifyTicketCreated(String userId, Ticket ticket) {
                createNotification(
                                userId,
                                "Ticket Submitted",
                                "Your ticket \"" + ticket.getTitle() + "\" has been submitted and is awaiting review.",
                                "TICKET_STATUS_CHANGED",
                                ticket.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "New Ticket Submitted",
                                        "A new ticket \"" + ticket.getTitle() + "\" has been submitted by "
                                                        + ticket.getUserName() + " and is awaiting review.",
                                        "TICKET_STATUS_CHANGED",
                                        ticket.getId());
                }

                // Email notification to user
                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "Ticket Submitted — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + "Your ticket \"" + ticket.getTitle()
                                                                + "\" has been submitted successfully.\n\n"
                                                                + "Category: " + ticket.getCategory() + "\n"
                                                                + "Priority: " + ticket.getPriority() + "\n\n"
                                                                + "You will be notified once it is reviewed.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send ticket created email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ── notifyTicketStatusChanged (Ticket overload) ──────────────────────
        public void notifyTicketStatusChanged(String userId, Ticket ticket) {
                String newStatus = ticket.getStatus().name();

                createNotification(
                                userId,
                                "Ticket Status Updated",
                                "Your ticket \"" + ticket.getTitle() + "\" status has been updated to: "
                                                + newStatus + ".",
                                "TICKET_STATUS_CHANGED",
                                ticket.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "Ticket Status Updated",
                                        "Ticket \"" + ticket.getTitle() + "\" by " + ticket.getUserName()
                                                        + " has been updated to: " + newStatus + ".",
                                        "TICKET_STATUS_CHANGED",
                                        ticket.getId());
                }

                // Email notification to user
                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "Ticket Update — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + "Your ticket \"" + ticket.getTitle()
                                                                + "\" status has been updated to: " + newStatus
                                                                + ".\n\n"
                                                                + (ticket.getResolutionNotes() != null
                                                                                ? "Notes: " + ticket
                                                                                                .getResolutionNotes()
                                                                                                + "\n\n"
                                                                                : "")
                                                                + "Log in to SmartCampus to view the full details.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send ticket status email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ── notifyTicketStatusChanged (String overload — kept for compatibility) ──
        public void notifyTicketStatusChanged(String userId, String ticketId, String newStatus) {
                createNotification(
                                userId,
                                "Ticket Status Updated",
                                "Your ticket status has been updated to: " + newStatus + ".",
                                "TICKET_STATUS_CHANGED",
                                ticketId);

                // Email notification
                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "Ticket Update — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + "Your ticket status has been updated to: " + newStatus
                                                                + ".\n\n"
                                                                + "Log in to SmartCampus to view the full details.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send ticket status email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ── notifyTicketRejected ─────────────────────────────────────────────
        public void notifyTicketRejected(String userId, Ticket ticket) {
                createNotification(
                                userId,
                                "Ticket Rejected",
                                "Your ticket \"" + ticket.getTitle() + "\" has been rejected."
                                                + (ticket.getRejectionReason() != null
                                                                ? " Reason: " + ticket.getRejectionReason()
                                                                : " Please contact admin for details."),
                                "TICKET_STATUS_CHANGED",
                                ticket.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "Ticket Rejected",
                                        "Ticket \"" + ticket.getTitle() + "\" by " + ticket.getUserName()
                                                        + " has been rejected.",
                                        "TICKET_STATUS_CHANGED",
                                        ticket.getId());
                }

                // Email notification to user
                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "Ticket Rejected — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + "Unfortunately, your ticket \"" + ticket.getTitle()
                                                                + "\" has been rejected.\n\n"
                                                                + (ticket.getRejectionReason() != null
                                                                                ? "Reason: " + ticket
                                                                                                .getRejectionReason()
                                                                                                + "\n\n"
                                                                                : "")
                                                                + "Please contact an administrator for more details.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send ticket rejected email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ── notifyTicketAssigned (notify ticket owner) ───────────────────────
        public void notifyTicketAssigned(String userId, Ticket ticket) {
                createNotification(
                                userId,
                                "Ticket Assigned",
                                "Your ticket \"" + ticket.getTitle() + "\" has been assigned to "
                                                + ticket.getAssignedToName() + " and is now in progress.",
                                "TICKET_STATUS_CHANGED",
                                ticket.getId());

                List<User> admins = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .collect(Collectors.toList());

                for (User admin : admins) {
                        createNotification(
                                        admin.getId(),
                                        "Ticket Assigned",
                                        "Ticket \"" + ticket.getTitle() + "\" by " + ticket.getUserName()
                                                        + " has been assigned to " + ticket.getAssignedToName() + ".",
                                        "TICKET_STATUS_CHANGED",
                                        ticket.getId());
                }

                // Email notification to user
                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "Ticket Assigned — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + "Your ticket \"" + ticket.getTitle()
                                                                + "\" has been assigned to "
                                                                + ticket.getAssignedToName()
                                                                + " and is now in progress.\n\n"
                                                                + "Log in to SmartCampus to view the full details.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send ticket assigned email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ── notifyTechnicianAssigned (notify assigned technician) ────────────
        public void notifyTechnicianAssigned(String technicianId, Ticket ticket) {
                createNotification(
                                technicianId,
                                "New Ticket Assigned to You",
                                "You have been assigned to ticket \"" + ticket.getTitle()
                                                + "\" submitted by " + ticket.getUserName()
                                                + ". Please review and take action.",
                                "TICKET_STATUS_CHANGED",
                                ticket.getId());

                // Email notification to technician
                userRepository.findById(technicianId).ifPresent(tech -> {
                        try {
                                emailService.sendEmail(
                                                tech.getEmail(),
                                                "New Ticket Assignment — SmartCampus",
                                                "Hi " + tech.getName() + ",\n\n"
                                                                + "You have been assigned a new ticket:\n\n"
                                                                + "Title: " + ticket.getTitle() + "\n"
                                                                + "Category: " + ticket.getCategory() + "\n"
                                                                + "Priority: " + ticket.getPriority() + "\n"
                                                                + "Submitted by: " + ticket.getUserName() + "\n\n"
                                                                + "Please log in to SmartCampus to review and take action.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send technician assigned email to {}: {}", tech.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ── notifyNewTicketComment ───────────────────────────────────────────
        public void notifyNewTicketComment(String userId, String ticketId, String commenterName) {
                createNotification(
                                userId,
                                "New Comment on Your Ticket",
                                commenterName + " added a comment on your ticket.",
                                "TICKET_COMMENT",
                                ticketId);
        }

        // ── notifyNewComment (Ticket overload) ───────────────────────────────
        public void notifyNewComment(String userId, Ticket ticket, String commenterName) {
                createNotification(
                                userId,
                                "New Comment on Your Ticket",
                                commenterName + " added a comment on your ticket \"" + ticket.getTitle() + "\".",
                                "TICKET_COMMENT",
                                ticket.getId());

                // Email notification to ticket owner
                userRepository.findById(userId).ifPresent(user -> {
                        try {
                                emailService.sendEmail(
                                                user.getEmail(),
                                                "New Comment on Your Ticket — SmartCampus",
                                                "Hi " + user.getName() + ",\n\n"
                                                                + commenterName
                                                                + " has added a comment on your ticket \""
                                                                + ticket.getTitle() + "\".\n\n"
                                                                + "Log in to SmartCampus to view the comment.\n\n"
                                                                + "SmartCampus Team");
                        } catch (Exception e) {
                                log.warn("Failed to send ticket comment email to {}: {}", user.getEmail(),
                                                e.getMessage());
                        }
                });
        }

        // ─────────────────────────────────────────────
        // RESOURCE NOTIFICATION TRIGGERS
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