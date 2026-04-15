package com.smartcampus.service;

import com.smartcampus.enums.AuditAction;
import com.smartcampus.model.AuditLog;
import com.smartcampus.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Audit log service — Member 4 responsibility.
 */
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(AuditAction action, String performedBy,
            String targetUser, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .performedBy(performedBy)
                .targetUser(targetUser)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getLogsByAction(AuditAction action) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action);
    }

    public List<AuditLog> getLogsByUser(String email) {
        return auditLogRepository.findByPerformedByOrderByTimestampDesc(email);
    }
}