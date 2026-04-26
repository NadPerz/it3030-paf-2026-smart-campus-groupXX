package com.smartcampus.controller;

import com.smartcampus.dto.OtpRequest;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    /** GET /api/auth/me */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/auth/logout */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    /** POST /api/auth/test-token — FOR TESTING ONLY */
    @PostMapping("/test-token")
    public ResponseEntity<String> getTestToken(
            @RequestParam String email,
            @RequestParam(defaultValue = "USER") String role) {
        String token = jwtService.generateToken(email, role);
        return ResponseEntity.ok(token);
    }

    /** POST /api/auth/verify-otp — verify the 6-digit code and issue JWT */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        if (user.getTwoFactorCode() == null
                || !user.getTwoFactorCode().equals(request.getCode())
                || user.getTwoFactorExpiry() == null
                || user.getTwoFactorExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired code"));
        }

        // Clear OTP after successful verification
        user.setTwoFactorCode(null);
        user.setTwoFactorExpiry(null);
        userRepository.save(user);

        // Now issue the JWT
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "status", user.getStatus().name()));
    }
}