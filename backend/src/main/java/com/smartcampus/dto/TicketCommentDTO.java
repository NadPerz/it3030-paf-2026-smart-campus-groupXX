package com.smartcampus.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCommentDTO {
    private String id;
    private String ticketId;
    private String userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
}