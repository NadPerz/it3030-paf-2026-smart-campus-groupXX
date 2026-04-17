package com.smartcampus.dto;

import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.Ticket;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponseDTO {
    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String userRegNo;
    private String title;
    private String category;
    private String description;
    private TicketPriority priority;
    private String location;
    private String contactDetails;
    private String faculty;
    private String resourceId;
    private TicketStatus status;
    private String assignedToId;
    private String assignedToName;
    private String resolutionNotes;
    private String rejectionReason;
    private List<String> imageUrls;
    private Ticket.AiTriageResult aiTriage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime assignedAt;
    private LocalDateTime resolvedAt;
    private String timeToFirstResponse;
    private String timeToResolution;
}