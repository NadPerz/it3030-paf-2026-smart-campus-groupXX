package com.smartcampus.dto;

import com.smartcampus.enums.TicketPriority;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be 5-200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be 10-2000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "^(ELECTRICAL|PLUMBING|IT|HVAC|GENERAL)$", message = "Category must be ELECTRICAL, PLUMBING, IT, HVAC, or GENERAL")
    private String category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Location is required")
    private String location;

    private String faculty;
    private String resourceId;
    private String contactDetails;
    private String userName;
    private String userEmail;
    private String userRegNo;
}
