package com.smartcampus.service;

import com.smartcampus.dto.TicketCommentDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;
    private final AiTriageService aiTriageService;

    // ── STATUS TRANSITION RULES ──────────────────────────────────────────────
    private static final Map<TicketStatus, List<TicketStatus>> TRANSITIONS = Map.of(
            TicketStatus.OPEN, List.of(TicketStatus.IN_PROGRESS, TicketStatus.REJECTED),
            TicketStatus.IN_PROGRESS, List.of(TicketStatus.RESOLVED, TicketStatus.REJECTED),
            TicketStatus.RESOLVED, List.of(TicketStatus.CLOSED));

    // ── DURATION FORMATTER ───────────────────────────────────────────────────
    private String formatDuration(LocalDateTime from, LocalDateTime to) {
        if (from == null || to == null)
            return null;
        long minutes = Duration.between(from, to).toMinutes();
        if (minutes < 1)
            return "< 1m";
        if (minutes < 60)
            return minutes + "m";
        long hours = minutes / 60;
        long mins = minutes % 60;
        if (hours < 24)
            return hours + "h " + mins + "m";
        long days = hours / 24;
        long hrs = hours % 24;
        return days + "d " + hrs + "h";
    }

    // ── CREATE TICKET ────────────────────────────────────────────────────────
    public TicketResponseDTO createTicket(String userId, String userName,
            TicketRequestDTO dto, List<MultipartFile> files) {
        List<String> imageUrls = List.of();
        if (files != null && !files.isEmpty()) {
            if (files.size() > 3)
                throw new RuntimeException("Maximum 3 images allowed");
            imageUrls = fileStorageService.saveAll(files, "tickets");
        }

        Ticket ticket = Ticket.builder()
                .userId(userId)
                .userName(userName)
                .userEmail(dto.getUserEmail())
                .userRegNo(dto.getUserRegNo())
                .title(dto.getTitle())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .location(dto.getLocation())
                .contactDetails(dto.getContactDetails())
                .resourceId(dto.getResourceId())
                .faculty(dto.getFaculty())
                .status(TicketStatus.OPEN)
                .imageUrls(imageUrls)
                .build();

        Ticket saved = ticketRepository.save(ticket);
        aiTriageService.runTriageAsync(saved.getId());

        // Notify user ticket created
        /*
         * try {
         * notificationService.notifyTicketCreated(userId, saved);
         * } catch (Exception e) {
         * // Non-critical
         * }
         */

        return toResponse(saved);
    }

    // ── GET ALL TICKETS ──────────────────────────────────────────────────────
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET MY TICKETS ───────────────────────────────────────────────────────
    public List<TicketResponseDTO> getMyTickets(String userId) {
        return ticketRepository.findByUserId(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET ASSIGNED TICKETS ─────────────────────────────────────────────────
    public List<TicketResponseDTO> getAssignedTickets(String techId) {
        return ticketRepository.findByAssignedToId(techId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET TICKET BY ID ─────────────────────────────────────────────────────
    public TicketResponseDTO getTicketById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
        return toResponse(ticket);
    }

    // ── UPDATE TICKET (OPEN only) ────────────────────────────────────────────
    public TicketResponseDTO updateTicket(String id, TicketRequestDTO dto) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));

        if (ticket.getStatus() != TicketStatus.OPEN)
            throw new RuntimeException("Cannot edit ticket after it has been processed");

        if (dto.getTitle() != null)
            ticket.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            ticket.setDescription(dto.getDescription());
        if (dto.getCategory() != null)
            ticket.setCategory(dto.getCategory());
        if (dto.getPriority() != null)
            ticket.setPriority(dto.getPriority());
        if (dto.getLocation() != null)
            ticket.setLocation(dto.getLocation());
        if (dto.getContactDetails() != null)
            ticket.setContactDetails(dto.getContactDetails());
        if (dto.getFaculty() != null)
            ticket.setFaculty(dto.getFaculty());
        if (dto.getResourceId() != null)
            ticket.setResourceId(dto.getResourceId());

        return toResponse(ticketRepository.save(ticket));
    }

    // ── UPDATE STATUS ────────────────────────────────────────────────────────
    public TicketResponseDTO updateTicketStatus(String id, TicketStatus newStatus,
            String notes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));

        List<TicketStatus> allowed = TRANSITIONS.getOrDefault(ticket.getStatus(), List.of());
        if (!allowed.contains(newStatus))
            throw new RuntimeException("Cannot transition from "
                    + ticket.getStatus() + " to " + newStatus);

        ticket.setStatus(newStatus);
        if (notes != null)
            ticket.setResolutionNotes(notes);
        if (newStatus == TicketStatus.RESOLVED)
            ticket.setResolvedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        // Notify user of status change
        /*
         * try {
         * notificationService.notifyTicketStatusChanged(ticket.getUserId(), saved);
         * } catch (Exception e) {
         * // Non-critical
         * }
         */

        return toResponse(saved);
    }

    // ── REJECT TICKET ────────────────────────────────────────────────────────
    public TicketResponseDTO rejectTicket(String id, String reason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(reason);

        Ticket saved = ticketRepository.save(ticket);

        // Notify user ticket rejected
        /*
         * try {
         * notificationService.notifyTicketRejected(ticket.getUserId(), saved);
         * } catch (Exception e) {
         * // Non-critical
         * }
         */

        return toResponse(saved);
    }

    // ── ASSIGN TECHNICIAN ────────────────────────────────────────────────────
    public TicketResponseDTO assignTicket(String ticketId, String technicianId, String technicianName) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        ticket.setAssignedToId(technicianId);
        ticket.setAssignedToName(technicianName);
        ticket.setAssignedAt(LocalDateTime.now()); // ← SLA: first response time
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        Ticket saved = ticketRepository.save(ticket);

        // Notify user ticket assigned
        /*
         * try {
         * notificationService.notifyTicketAssigned(ticket.getUserId(), saved);
         * } catch (Exception e) {
         * // Non-critical
         * }
         * 
         * // Notify technician of new assignment
         * try {
         * notificationService.notifyTechnicianAssigned(technicianId, saved);
         * } catch (Exception e) {
         * // Non-critical
         * }
         */

        return toResponse(saved);
    }

    // ── ADD COMMENT ──────────────────────────────────────────────────────────
    public TicketCommentDTO addComment(String ticketId, String userId,
            String userName, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        TicketComment comment = TicketComment.builder()
                .ticketId(ticketId)
                .userId(userId)
                .userName(userName)
                .content(content)
                .build();

        TicketComment saved = commentRepository.save(comment);

        // Notify ticket owner of new comment (if commenter is not the owner)
        /*
         * try {
         * if (!userId.equals(ticket.getUserId())) {
         * notificationService.notifyNewComment(ticket.getUserId(), ticket, userName);
         * }
         * } catch (Exception e) {
         * // Non-critical
         * }
         */

        return toCommentResponse(saved);
    }

    // ── GET COMMENTS ─────────────────────────────────────────────────────────
    public List<TicketCommentDTO> getComments(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(this::toCommentResponse).collect(Collectors.toList());
    }

    // ── DELETE COMMENT ───────────────────────────────────────────────────────
    public void deleteComment(String commentId, String userId, boolean isAdmin) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!isAdmin && !comment.getUserId().equals(userId))
            throw new RuntimeException("Cannot delete another user's comment");
        commentRepository.deleteById(commentId);
    }

    // ── EDIT COMMENT ─────────────────────────────────────────────────────────
    public TicketCommentDTO editComment(String commentId, String userId, String content) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUserId().equals(userId))
            throw new RuntimeException("Cannot edit another user's comment");
        comment.setContent(content);
        return toCommentResponse(commentRepository.save(comment));
    }

    // ── DELETE TICKET ────────────────────────────────────────────────────────
    public void deleteTicket(String id) {
        ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
        commentRepository.deleteByTicketId(id);
        ticketRepository.deleteById(id);
    }

    // ── MAPPER ───────────────────────────────────────────────────────────────
    private TicketResponseDTO toResponse(Ticket t) {
        return TicketResponseDTO.builder()
                .id(t.getId())
                .userId(t.getUserId())
                .userName(t.getUserName())
                .userEmail(t.getUserEmail())
                .userRegNo(t.getUserRegNo())
                .title(t.getTitle())
                .category(t.getCategory())
                .description(t.getDescription())
                .priority(t.getPriority())
                .location(t.getLocation())
                .contactDetails(t.getContactDetails())
                .faculty(t.getFaculty())
                .resourceId(t.getResourceId())
                .status(t.getStatus())
                .assignedToId(t.getAssignedToId())
                .assignedToName(t.getAssignedToName())
                .assignedAt(t.getAssignedAt())
                .resolutionNotes(t.getResolutionNotes())
                .rejectionReason(t.getRejectionReason())
                .imageUrls(t.getImageUrls())
                .aiTriage(t.getAiTriage())
                .resolvedAt(t.getResolvedAt())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                // ── SLA timers ──
                .timeToFirstResponse(formatDuration(t.getCreatedAt(), t.getAssignedAt()))
                .timeToResolution(formatDuration(t.getCreatedAt(), t.getResolvedAt()))
                .build();
    }

    private TicketCommentDTO toCommentResponse(TicketComment c) {
        return TicketCommentDTO.builder()
                .id(c.getId())
                .ticketId(c.getTicketId())
                .userId(c.getUserId())
                .userName(c.getUserName())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
