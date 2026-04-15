package com.smartcampus.repository;

import com.smartcampus.enums.AuditAction;
import com.smartcampus.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findByPerformedByOrderByTimestampDesc(String email);

    List<AuditLog> findByTargetUserOrderByTimestampDesc(String email);

    List<AuditLog> findByActionOrderByTimestampDesc(AuditAction action);

    List<AuditLog> findAllByOrderByTimestampDesc();
}