package com.smartcampus.controller;

import com.smartcampus.dto.TicketCommentDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.Ticket;
import com.smartcampus.service.AiTriageService;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AiTriageService aiTriageService;
    private final com.smartcampus.repository.TicketRepository ticketRepository;

    // POST /api/tickets — Create ticket
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestPart("data") TicketRequestDTO dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getAttribute("sub");
        String userName = principal.getAttribute("name");
        return ResponseEntity.status(201)
                .body(ticketService.createTicket(userId, userName, dto, files));
    }

    // GET /api/tickets — All tickets (Admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET /api/tickets/my — Current user's tickets
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getAttribute("sub");
        return ResponseEntity.ok(ticketService.getMyTickets(userId));
    }

    // GET /api/tickets/assigned — Technician's assigned tickets
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketResponseDTO>> getAssignedTickets(
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getAttribute("sub");
        return ResponseEntity.ok(ticketService.getAssignedTickets(userId));
    }

    // GET /api/tickets/{id} — Get single ticket
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDTO> getTicketById(
            @PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // PUT /api/tickets/{id} — Update ticket (reporter only)
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable String id,
            @Valid @RequestBody TicketRequestDTO dto) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // PATCH /api/tickets/{id}/status — Change status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        TicketStatus status = TicketStatus.valueOf(body.get("status"));
        String notes = body.get("notes");
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes));
    }

    // PATCH /api/tickets/{id}/assign — Assign technician
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDTO> assignTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                ticketService.assignTicket(id, body.get("technicianId")));
    }

    // PATCH /api/tickets/{id}/reject — Reject ticket
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDTO> rejectTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                ticketService.rejectTicket(id, body.get("reason")));
    }

    // POST /api/tickets/{id}/comments — Add comment
    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketCommentDTO> addComment(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getAttribute("sub");
        String userName = principal.getAttribute("name");
        return ResponseEntity.status(201).body(
                ticketService.addComment(id, userId, userName, body.get("content")));
    }

    // GET /api/tickets/{id}/comments — Get comments
    @GetMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketCommentDTO>> getComments(
            @PathVariable String id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    // PUT /api/tickets/{id}/comments/{cid} — Edit comment
    @PutMapping("/{id}/comments/{cid}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketCommentDTO> editComment(
            @PathVariable String id,
            @PathVariable String cid,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getAttribute("sub");
        return ResponseEntity.ok(
                ticketService.editComment(cid, userId, body.get("content")));
    }

    // DELETE /api/tickets/{id}/comments/{cid} — Delete comment
    @DeleteMapping("/{id}/comments/{cid}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable String cid,
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getAttribute("sub");
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ticketService.deleteComment(cid, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/tickets/{id} — Delete ticket (Admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/tickets/{id}/triage — Run AI triage
    @PostMapping("/{id}/triage")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket.AiTriageResult> runTriage(
            @PathVariable String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Ticket.AiTriageResult result = aiTriageService.analyze(ticket);
        ticket.setAiTriage(result);
        ticketRepository.save(ticket);
        return ResponseEntity.ok(result);
    }

    // GET /api/tickets/{id}/triage — Get AI triage result
    @GetMapping("/{id}/triage")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket.AiTriageResult> getTriageResult(
            @PathVariable String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (ticket.getAiTriage() == null)
            return ResponseEntity.noContent().build();
        return ResponseEntity.ok(ticket.getAiTriage());
    }
}