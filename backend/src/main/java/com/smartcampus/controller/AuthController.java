package com.smartcampus.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication REST controller — Member 4 responsibility.
 * Base path: /api/auth
 *
 * TODO (Member 4): Implement OAuth2 Google sign-in integration.
 *   - The /me endpoint should extract the authenticated user from the OAuth2 principal
 *   - The /logout endpoint should invalidate the session and clear the security context
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    /** GET /api/auth/me — Get the currently authenticated user's profile */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        // TODO (Member 4): Extract OAuth2 principal, find or create User in DB, return UserDTO
        return ResponseEntity.ok().build();
    }

    /** POST /api/auth/logout — Log out the current user */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // TODO (Member 4): Invalidate session / clear security context
        return ResponseEntity.ok().build();
    }
}
