package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiTriageService {

    private final TicketRepository ticketRepository;

    @Async
    public void runTriageAsync(String ticketId) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
            Ticket.AiTriageResult result = analyze(ticket);
            ticket.setAiTriage(result);
            ticketRepository.save(ticket);
            log.info("AI triage completed for ticket {}", ticketId);
        } catch (Exception e) {
            log.error("AI triage failed for ticket {}: {}", ticketId, e.getMessage());
        }
    }

    public Ticket.AiTriageResult analyze(Ticket ticket) {
        String title = ticket.getTitle() != null ? ticket.getTitle().toLowerCase() : "";
        String description = ticket.getDescription() != null ? ticket.getDescription().toLowerCase() : "";
        String category = ticket.getCategory() != null ? ticket.getCategory() : "GENERAL";
        String priority = ticket.getPriority() != null ? ticket.getPriority().name() : "MEDIUM";
        String location = ticket.getLocation() != null ? ticket.getLocation() : "";
        String combined = title + " " + description;

        String suggestedPriority;
        String suggestedCategory;
        String recommendedAction;
        String estimatedTime;
        String reasoning;

        // ── Determine category from keywords ─────────────────────────────────
        if (combined.matches(".*(electrical|power|short circuit|socket|wiring|light|electricity|voltage).*")) {
            suggestedCategory = "ELECTRICAL";
        } else if (combined.matches(".*(pipe|water|leak|flood|drain|plumbing|tap|toilet|bathroom).*")) {
            suggestedCategory = "PLUMBING";
        } else if (combined.matches(
                ".*(network|internet|wifi|computer|laptop|projector|screen|printer|server|software|system).*")) {
            suggestedCategory = "IT";
        } else if (combined.matches(".*(ac|air condition|hvac|fan|ventilation|cooling|heating|temperature).*")) {
            suggestedCategory = "HVAC";
        } else {
            suggestedCategory = category;
        }

        // ── Determine priority from keywords ─────────────────────────────────
        if (combined.matches(
                ".*(fire|flood|emergency|danger|unsafe|electrical shock|electrocution|gas leak|collapse|injury|urgent|critical|broken pipe|power outage|no power).*")) {
            suggestedPriority = "CRITICAL";
        } else if (combined.matches(
                ".*(not working|broken|failed|cannot|unable|urgent|affecting|blocked|stopped|no internet|no water|no power).*")) {
            if (priority.equals("LOW")) {
                suggestedPriority = "MEDIUM";
            } else {
                suggestedPriority = "HIGH";
            }
        } else if (combined.matches(".*(slow|intermittent|sometimes|minor|small|little|occasional).*")) {
            suggestedPriority = "LOW";
        } else {
            suggestedPriority = priority;
        }

        // ── Determine action and time by category ─────────────────────────────
        switch (suggestedCategory) {
            case "ELECTRICAL" -> {
                if (suggestedPriority.equals("CRITICAL")) {
                    recommendedAction = "Immediately evacuate area and contact emergency electrician. Do not use any electrical switches.";
                    estimatedTime = "1-2 hours (emergency)";
                    reasoning = "Electrical emergency detected. Immediate action required to prevent injury or fire hazard.";
                } else if (suggestedPriority.equals("HIGH")) {
                    recommendedAction = "Send licensed electrician to inspect wiring and repair faulty connections.";
                    estimatedTime = "4-8 hours";
                    reasoning = "Electrical fault detected. Could escalate to safety hazard if not addressed promptly.";
                } else {
                    recommendedAction = "Schedule electrician for routine inspection and repair.";
                    estimatedTime = "1-2 working days";
                    reasoning = "Minor electrical issue. Schedule during non-peak hours to minimize disruption.";
                }
            }
            case "PLUMBING" -> {
                if (suggestedPriority.equals("CRITICAL")) {
                    recommendedAction = "Shut off main water valve immediately. Contact emergency plumber. Clear affected area.";
                    estimatedTime = "1-3 hours (emergency)";
                    reasoning = "Severe water leak or flooding detected. Immediate intervention needed to prevent structural damage.";
                } else if (suggestedPriority.equals("HIGH")) {
                    recommendedAction = "Send plumber to inspect and fix pipe/drainage issue. Block off affected area.";
                    estimatedTime = "4-6 hours";
                    reasoning = "Active plumbing issue that may worsen and cause water damage if left unattended.";
                } else {
                    recommendedAction = "Schedule plumber for inspection and repair within the week.";
                    estimatedTime = "2-3 working days";
                    reasoning = "Minor plumbing issue. Can be addressed during scheduled maintenance.";
                }
            }
            case "IT" -> {
                if (suggestedPriority.equals("CRITICAL") || suggestedPriority.equals("HIGH")) {
                    recommendedAction = "IT technician to diagnose network/hardware issue. Check server room and access points.";
                    estimatedTime = "2-4 hours";
                    reasoning = "IT failure affecting multiple users or critical systems. Requires immediate attention.";
                } else {
                    recommendedAction = "IT support to remotely diagnose and fix. Schedule on-site visit if needed.";
                    estimatedTime = "Same day or next working day";
                    reasoning = "IT issue affecting individual user. Remote support may resolve without on-site visit.";
                }
            }
            case "HVAC" -> {
                if (suggestedPriority.equals("CRITICAL") || suggestedPriority.equals("HIGH")) {
                    recommendedAction = "Dispatch HVAC technician immediately. Check refrigerant levels, compressor, and thermostat.";
                    estimatedTime = "3-5 hours";
                    reasoning = "HVAC failure in occupied area poses health risk especially in hot weather. Urgent response needed.";
                } else {
                    recommendedAction = "Schedule HVAC maintenance. Check filters, vents, and control units.";
                    estimatedTime = "1-2 working days";
                    reasoning = "HVAC performance issue. Preventive maintenance will avoid full system failure.";
                }
            }
            default -> {
                if (suggestedPriority.equals("CRITICAL") || suggestedPriority.equals("HIGH")) {
                    recommendedAction = "Assign maintenance team immediately. Assess situation on-site and take corrective action.";
                    estimatedTime = "4-8 hours";
                    reasoning = "High priority maintenance issue reported at " + location
                            + ". Requires urgent attention.";
                } else {
                    recommendedAction = "Add to maintenance schedule. Assign available technician for inspection and repair.";
                    estimatedTime = "2-5 working days";
                    reasoning = "Routine maintenance request. Can be handled during normal working hours.";
                }
            }
        }

        return Ticket.AiTriageResult.builder()
                .suggestedPriority(suggestedPriority)
                .suggestedCategory(suggestedCategory)
                .reasoning(reasoning)
                .recommendedAction(recommendedAction)
                .estimatedResolutionTime(estimatedTime)
                .analyzedAt(LocalDateTime.now())
                .build();
    }
}