package com.smartcampus.service;

import com.smartcampus.enums.UserRole;
import com.smartcampus.enums.UserStatus;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * User management service — Member 4 responsibility.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final NotificationService notificationService; // ← added

    /** Get all users — ADMIN only */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /** Get user by ID */
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    /** Change a user's role — ADMIN only */
    public User updateUserRole(String id, UserRole newRole) {
        User user = getUserById(id);
        UserRole oldRole = user.getRole(); // capture before update
        user.setRole(newRole);
        User saved = userRepository.save(user);
        notificationService.notifyRoleChanged(saved, oldRole, newRole); // ← notify
        return saved;
    }

    /** Update logged-in user's own name */
    public User updateMyName(String email, String name) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String oldName = user.getName(); // capture before update
        user.setName(name);
        User saved = userRepository.save(user);
        notificationService.notifyProfileNameUpdated(saved, oldName); // ← notify
        return saved;
    }

    /** Approve a user — ADMIN only */
    public User approveUser(String id) {
        User user = getUserById(id);
        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(user);
        notificationService.notifyAccountApproved(saved); // ← notify
        return saved;
    }

    /** Suspend a user — ADMIN only */
    public User suspendUser(String id) {
        User user = getUserById(id);
        user.setStatus(UserStatus.SUSPENDED);
        User saved = userRepository.save(user);
        notificationService.notifyAccountSuspended(saved); // ← notify
        return saved;
    }

    /** Reactivate a suspended user — ADMIN only */
    public User reactivateUser(String id) {
        User user = getUserById(id);
        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(user);
        notificationService.notifyAccountReactivated(saved); // ← notify
        return saved;
    }

    /** Get count of pending users */
    public long getPendingCount() {
        return userRepository.findAll().stream()
                .filter(u -> u.getStatus() == UserStatus.PENDING)
                .count();
    }

    /** Deactivate/delete a user — ADMIN only */
    public void deleteUser(String id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}