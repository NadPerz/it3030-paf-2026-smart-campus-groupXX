package com.smartcampus.controller;

import com.smartcampus.enums.AuditAction;
import com.smartcampus.enums.UserRole;
import com.smartcampus.model.User;
import com.smartcampus.service.AuditLogService;
import com.smartcampus.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * User management controller — Member 4 responsibility.
 * Base path: /api/users
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuditLogService auditLogService;

    /** GET /api/users — List all users (ADMIN only) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** GET /api/users/pending-count — Get count of pending users (ADMIN only) */
    @GetMapping("/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getPendingCount() {
        return ResponseEntity.ok(Map.of("count", userService.getPendingCount()));
    }

    /** GET /api/users/{id} — Get user profile by ID */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /** PUT /api/users/{id}/role — Change user role (ADMIN only) */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserRole newRole = UserRole.valueOf(body.get("role").toUpperCase());
        User updated = userService.updateUserRole(id, newRole);
        auditLogService.log(
                AuditAction.ROLE_CHANGED, adminEmail, updated.getEmail(),
                "Role changed to " + newRole, request.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    /** PUT /api/users/{id}/approve — Approve a user (ADMIN only) */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> approveUser(@PathVariable String id,
            HttpServletRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User approved = userService.approveUser(id);
        auditLogService.log(
                AuditAction.USER_APPROVED, adminEmail, approved.getEmail(),
                "User account approved", request.getRemoteAddr());
        return ResponseEntity.ok(approved);
    }

    /** PUT /api/users/{id}/suspend — Suspend a user (ADMIN only) */
    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> suspendUser(@PathVariable String id,
            HttpServletRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User suspended = userService.suspendUser(id);
        auditLogService.log(
                AuditAction.USER_SUSPENDED, adminEmail, suspended.getEmail(),
                "User account suspended", request.getRemoteAddr());
        return ResponseEntity.ok(suspended);
    }

    /** PUT /api/users/{id}/reactivate — Reactivate a user (ADMIN only) */
    @PutMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> reactivateUser(@PathVariable String id,
            HttpServletRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User reactivated = userService.reactivateUser(id);
        auditLogService.log(
                AuditAction.USER_REACTIVATED, adminEmail, reactivated.getEmail(),
                "User account reactivated", request.getRemoteAddr());
        return ResponseEntity.ok(reactivated);
    }

    /** PUT /api/users/profile — Update own profile name */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateMyProfile(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userService.updateMyName(email, body.get("name"));
        auditLogService.log(
                AuditAction.PROFILE_UPDATED, email, email,
                "Profile name updated", request.getRemoteAddr());
        return ResponseEntity.ok(user);
    }

    /** DELETE /api/users/{id} — Remove user (ADMIN only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id,
            HttpServletRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserById(id);
        auditLogService.log(
                AuditAction.USER_DELETED, adminEmail, user.getEmail(),
                "User account deleted", request.getRemoteAddr());
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}