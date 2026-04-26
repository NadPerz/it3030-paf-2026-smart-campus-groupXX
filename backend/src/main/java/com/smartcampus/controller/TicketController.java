package com.smartcampus.controller;

import com.smartcampus.dto.TicketCommentDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.AiTriageService;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.smartcampus.enums.TicketPriority;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AiTriageService aiTriageService;
    private final com.smartcampus.repository.TicketRepository ticketRepository;
    private final UserRepository userRepository;

    // ── Helper: works with BOTH JWT and OAuth2 ────────────────────────────────
    private User resolveUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not authenticated");
        }

        String email = null;

        // Case 1: JWT token — principal is a String (the email/username from JWT)
        Object principal = authentication.getPrincipal();
        if (principal instanceof String) {
            email = (String) principal;
        }
        // Case 2: OAuth2 login — principal is OAuth2User
        else if (principal instanceof OAuth2User oAuth2User) {
            email = oAuth2User.getAttribute("email");
        }
        // Case 3: Spring UserDetails
        else if (principal instanceof org.springframework.security.core.userdetails.UserDetails ud) {
            email = ud.getUsername();
        }

        if (email == null || email.equals("anonymousUser")) {
            throw new RuntimeException("Not authenticated");
        }

        String finalEmail = email;
        return userRepository.findByEmail(finalEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + finalEmail));
    }

    private String getUserName(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User oAuth2User) {
            String name = oAuth2User.getAttribute("name");
            return name != null ? name : "Unknown";
        }
        // For JWT, fall back to email as display name — the DTO will override it
        return authentication.getName();
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<TicketResponseDTO> createTicketMultipart(
            @RequestParam(value = "title") String title,
            @RequestParam(value = "category") String category,
            @RequestParam(value = "priority", defaultValue = "MEDIUM") String priority,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "description") String description,
            @RequestParam(value = "contactDetails", required = false) String contactDetails,
            @RequestParam(value = "faculty", required = false) String faculty,
            @RequestParam(value = "resourceId", required = false) String resourceId,
            @RequestParam(value = "userName", required = false) String userNameParam,
            @RequestParam(value = "userEmail", required = false) String userEmail,
            @RequestParam(value = "userRegNo", required = false) String userRegNo,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {

        User user = resolveUser(authentication);

        TicketPriority priorityEnum;
        try {
            priorityEnum = TicketPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            priorityEnum = TicketPriority.MEDIUM;
        }

        TicketRequestDTO dto = TicketRequestDTO.builder()
                .title(title)
                .category(category)
                .priority(priorityEnum)
                .location(location)
                .description(description)
                .contactDetails(contactDetails)
                .faculty(faculty)
                .resourceId(resourceId)
                .userEmail(userEmail != null ? userEmail : user.getEmail())
                .userRegNo(userRegNo)
                .build();

        String userName = (userNameParam != null && !userNameParam.isBlank())
                ? userNameParam
                : user.getName() != null ? user.getName() : getUserName(authentication);

        return ResponseEntity.status(201)
                .body(ticketService.createTicket(user.getId(), userName, dto, files));
    }

    // Keep original JSON endpoint for backward compatibility
    @PostMapping(consumes = "application/json")
    public ResponseEntity<TicketResponseDTO> createTicket(
            @RequestBody TicketRequestDTO dto,
            Authentication authentication) {

        User user = resolveUser(authentication);
        String userName = (dto.getUserName() != null && !dto.getUserName().isBlank())
                ? dto.getUserName()
                : user.getName() != null ? user.getName() : getUserName(authentication);

        return ResponseEntity.status(201)
                .body(ticketService.createTicket(user.getId(), userName, dto, null));
    }

    // ── GET ALL (admin) ───────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // ── GET MY TICKETS ────────────────────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    // ── GET ASSIGNED (technician) ─────────────────────────────────────────────
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponseDTO>> getAssignedTickets(Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(ticketService.getAssignedTickets(user.getId()));
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable String id,
            @RequestBody TicketRequestDTO dto) {
        return ResponseEntity.ok(ticketService.updateTicket(id, dto));
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // ── STATUS ────────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        TicketStatus status = TicketStatus.valueOf(body.get("status"));
        String notes = body.get("notes");
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes));
    }

    // ── ASSIGN ────────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                ticketService.assignTicket(id, body.get("technicianId"), body.get("technicianName")));
    }

    // ── REJECT ────────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/reject")
    public ResponseEntity<TicketResponseDTO> rejectTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                ticketService.rejectTicket(id, body.get("reason")));
    }

    // ── ADD COMMENT ───────────────────────────────────────────────────────────
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentDTO> addComment(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        User user = resolveUser(authentication);
        String userName = (body.get("userName") != null && !body.get("userName").isBlank())
                ? body.get("userName")
                : user.getName() != null ? user.getName() : getUserName(authentication);

        return ResponseEntity.status(201).body(
                ticketService.addComment(id, user.getId(), userName, body.get("content")));
    }

    // ── GET COMMENTS ──────────────────────────────────────────────────────────
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentDTO>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    // ── EDIT COMMENT ──────────────────────────────────────────────────────────
    @PutMapping("/{id}/comments/{cid}")
    public ResponseEntity<TicketCommentDTO> editComment(
            @PathVariable String id,
            @PathVariable String cid,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        User user = resolveUser(authentication);
        return ResponseEntity.ok(
                ticketService.editComment(cid, user.getId(), body.get("content")));
    }

    // ── DELETE COMMENT ────────────────────────────────────────────────────────
    @DeleteMapping("/{id}/comments/{cid}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable String cid,
            Authentication authentication) {

        User user = resolveUser(authentication);
        boolean isAdmin = user.getRole() != null &&
                user.getRole().name().equals("ADMIN");
        ticketService.deleteComment(cid, user.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    // ── AI TRIAGE ─────────────────────────────────────────────────────────────
    @PostMapping("/{id}/triage")
    public ResponseEntity<Ticket.AiTriageResult> runTriage(@PathVariable String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Ticket.AiTriageResult result = aiTriageService.analyze(ticket);
        ticket.setAiTriage(result);
        ticketRepository.save(ticket);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/triage")
    public ResponseEntity<Ticket.AiTriageResult> getTriageResult(@PathVariable String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (ticket.getAiTriage() == null)
            return ResponseEntity.noContent().build();
        return ResponseEntity.ok(ticket.getAiTriage());
    }
}