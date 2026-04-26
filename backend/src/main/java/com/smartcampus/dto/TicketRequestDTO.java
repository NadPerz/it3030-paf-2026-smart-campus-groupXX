package com.smartcampus.dto;

import com.smartcampus.enums.TicketPriority;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequestDTO {

    private String title;
    private String description;
    private String category;
    private TicketPriority priority;
    private String location;
    private String faculty;
    private String resourceId;
    private String contactDetails;
    private String userName;
    private String userEmail;
    private String userRegNo;
}