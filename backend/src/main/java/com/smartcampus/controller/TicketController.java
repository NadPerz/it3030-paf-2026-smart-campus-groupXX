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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AiTriageService aiTriageService;
    private final com.smartcampus.repository.TicketRepository ticketRepository;

    // ── Helpers ───────────────────────────────────────────────────────────────
    private String getUserId(OAuth2User principal) {
        if (principal == null)
            return "test-user-001";
        String sub = principal.getAttribute("sub");
        return sub != null ? sub : "test-user-001";
    }

    private String getUserName(OAuth2User principal) {
        if (principal == null)
            return "Test User";
        String name = principal.getAttribute("name");
        return name != null ? name : "Test User";
    }

    // POST /api/tickets — Create ticket
    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody TicketRequestDTO dto,
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = getUserId(principal);
        // Use name from frontend form if available, else fallback to OAuth/default
        String userName = (dto.getUserName() != null && !dto.getUserName().isBlank())
                ? dto.getUserName()
                : getUserName(principal);
        return ResponseEntity.status(201)
                .body(ticketService.createTicket(userId, userName, dto, null));
    }

    // GET /api/tickets — All tickets
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET /api/tickets/my — Current user's tickets
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = getUserId(principal);
        return ResponseEntity.ok(ticketService.getMyTickets(userId));
    }

    // GET /api/tickets/assigned — Technician's assigned tickets
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponseDTO>> getAssignedTickets(
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = getUserId(principal);
        return ResponseEntity.ok(ticketService.getAssignedTickets(userId));
    }

    // GET /api/tickets/{id} — Get single ticket
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // PUT /api/tickets/{id} — Update ticket
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable String id,
            @RequestBody TicketRequestDTO dto) {
        return ResponseEntity.ok(ticketService.updateTicket(id, dto));
    }

    // DELETE /api/tickets/{id} — Delete ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/tickets/{id}/status — Change status
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        TicketStatus status = TicketStatus.valueOf(body.get("status"));
        String notes = body.get("notes");
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes));
    }

    // PATCH /api/tickets/{id}/assign — Assign technician
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                ticketService.assignTicket(id, body.get("technicianId"), body.get("technicianName")));
    }

    // PATCH /api/tickets/{id}/reject — Reject ticket
    @PatchMapping("/{id}/reject")
    public ResponseEntity<TicketResponseDTO> rejectTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                ticketService.rejectTicket(id, body.get("reason")));
    }

    // POST /api/tickets/{id}/comments — Add comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentDTO> addComment(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = getUserId(principal);
        // Use userName from frontend if provided
        String userName = (body.get("userName") != null && !body.get("userName").isBlank())
                ? body.get("userName")
                : getUserName(principal);
        return ResponseEntity.status(201).body(
                ticketService.addComment(id, userId, userName, body.get("content")));
    }

    // GET /api/tickets/{id}/comments — Get comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentDTO>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    // PUT /api/tickets/{id}/comments/{cid} — Edit comment
    @PutMapping("/{id}/comments/{cid}")
    public ResponseEntity<TicketCommentDTO> editComment(
            @PathVariable String id,
            @PathVariable String cid,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = getUserId(principal);
        return ResponseEntity.ok(
                ticketService.editComment(cid, userId, body.get("content")));
    }

    // DELETE /api/tickets/{id}/comments/{cid} — Delete comment
    @DeleteMapping("/{id}/comments/{cid}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable String cid,
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = getUserId(principal);
        ticketService.deleteComment(cid, userId, true);
        return ResponseEntity.noContent().build();
    }

    // POST /api/tickets/{id}/triage — Run AI triage
    @PostMapping("/{id}/triage")
    public ResponseEntity<Ticket.AiTriageResult> runTriage(@PathVariable String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Ticket.AiTriageResult result = aiTriageService.analyze(ticket);
        ticket.setAiTriage(result);
        ticketRepository.save(ticket);
        return ResponseEntity.ok(result);
    }

    // GET /api/tickets/{id}/triage — Get AI triage result
    @GetMapping("/{id}/triage")
    public ResponseEntity<Ticket.AiTriageResult> getTriageResult(@PathVariable String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (ticket.getAiTriage() == null)
            return ResponseEntity.noContent().build();
        return ResponseEntity.ok(ticket.getAiTriage());
    }
}
