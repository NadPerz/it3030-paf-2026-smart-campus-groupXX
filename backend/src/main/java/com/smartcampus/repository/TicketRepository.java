package com.smartcampus.repository;

import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Ticket repository — Member 3 (Incident tickets).
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(Long technicianId);
}
