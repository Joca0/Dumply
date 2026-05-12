package com.dumply.common.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Representação de um registro de auditoria para resposta no endpoint
 * administrativo {@code GET /admin/audit/logs} (Req. 5.4).
 *
 * <p>Não expõe metadados internos do JPA, apenas os campos relevantes
 * para análise.</p>
 *
 * @param id         identificador do registro
 * @param userId     UUID do usuário associado (pode ser nulo)
 * @param companyId  tenant associado (pode ser nulo)
 * @param email      e-mail informado na operação
 * @param eventType  tipo do evento (vide {@link AuditEventType})
 * @param outcome    resultado: SUCCESS ou FAILURE
 * @param ipAddress  IP de origem
 * @param userAgent  User-Agent do dispositivo
 * @param details    metadados livres (geralmente JSON)
 * @param timestamp  carimbo temporal do evento
 */
public record AuditLogResponse(
        UUID id,
        UUID userId,
        UUID companyId,
        String email,
        String eventType,
        String outcome,
        String ipAddress,
        String userAgent,
        String details,
        LocalDateTime timestamp
) {}
