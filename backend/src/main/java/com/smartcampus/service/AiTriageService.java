package com.smartcampus.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiTriageService {

    @Value("${anthropic.api.key:YOUR_KEY}")
    private String apiKey;

    @Value("${anthropic.api.url:https://api.anthropic.com/v1/messages}")
    private String apiUrl;

    @Value("${anthropic.model:claude-sonnet-4-20250514}")
    private String model;

    private final TicketRepository ticketRepository;
    private final WebClient.Builder webClientBuilder;

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
        String prompt = "You are a university facilities AI. Analyze this ticket.\n"
                + "Respond ONLY in JSON — no markdown, no extra text.\n\n"
                + "Title: " + ticket.getTitle() + "\n"
                + "Description: " + ticket.getDescription() + "\n"
                + "Category: " + ticket.getCategory() + "\n"
                + "Location: " + ticket.getLocation() + "\n"
                + "Priority: " + ticket.getPriority() + "\n\n"
                + "Return ONLY this JSON:\n"
                + "{\"suggestedPriority\":\"LOW|MEDIUM|HIGH|CRITICAL\","
                + "\"suggestedCategory\":\"ELECTRICAL|PLUMBING|IT|HVAC|GENERAL\","
                + "\"reasoning\":\"brief reason\","
                + "\"recommendedAction\":\"next step\","
                + "\"estimatedResolutionTime\":\"e.g. 2 hours\"}";

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", 500,
                "messages", List.of(Map.of("role", "user", "content", prompt)));

        try {
            WebClient client = webClientBuilder.build();
            Map<?, ?> response = client.post().uri(apiUrl)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            String text = ((Map<?, ?>) ((List<?>) response.get("content"))
                    .get(0)).get("text").toString();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(text.trim());

            return Ticket.AiTriageResult.builder()
                    .suggestedPriority(node.get("suggestedPriority").asText())
                    .suggestedCategory(node.get("suggestedCategory").asText())
                    .reasoning(node.get("reasoning").asText())
                    .recommendedAction(node.get("recommendedAction").asText())
                    .estimatedResolutionTime(node.get("estimatedResolutionTime").asText())
                    .analyzedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("AI API call failed: {}", e.getMessage());
            return Ticket.AiTriageResult.builder()
                    .suggestedPriority(ticket.getPriority().name())
                    .suggestedCategory(ticket.getCategory())
                    .reasoning("AI unavailable — using submitted values")
                    .recommendedAction("Review ticket manually")
                    .estimatedResolutionTime("Unknown")
                    .analyzedAt(LocalDateTime.now())
                    .build();
        }
    }
}