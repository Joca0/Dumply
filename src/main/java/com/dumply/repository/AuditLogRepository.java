package com.dumply.repository;

import com.dumply.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repositório append-only para a entidade {@link AuditLog}.
 *
 * <p>Estende apenas {@link Repository}, sem expor os métodos {@code delete*}
 * ou {@code save} em modo upsert da {@link org.springframework.data.jpa.repository.JpaRepository}.
 * Garante, no nível da aplicação, a integridade dos logs de auditoria
 * (Req. 5.3 — proteção contra alteração dos logs).</p>
 *
 * <p>Para reforço adicional, recomenda-se revogar privilégios de UPDATE/DELETE
 * para o usuário de aplicação na tabela {@code audit_log} no nível do SGBD,
 * conforme documentado em {@code AUDIT_LOGS.md}.</p>
 */
public interface AuditLogRepository extends Repository<AuditLog, UUID> {

    /**
     * Persiste um novo evento de auditoria. Como o ID é gerado pelo provider JPA,
     * toda chamada resulta em INSERT (nunca UPDATE).
     */
    AuditLog save(AuditLog auditLog);

    /**
     * Recupera o histórico de eventos de um usuário, ordenado do mais recente
     * para o mais antigo. Suporta paginação para evitar carga excessiva.
     */
    Page<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId, Pageable pageable);

    /**
     * Recupera todos os eventos de um determinado tipo dentro de um intervalo
     * temporal. Utilizado para o exemplo de análise de logs (Req. 5.4) —
     * por exemplo, listar todas as falhas de login das últimas 24 horas.
     */
    Page<AuditLog> findByEventTypeAndTimestampBetweenOrderByTimestampDesc(
            String eventType,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

    /**
     * Recupera eventos por tenant (empresa), útil em painéis administrativos
     * multi-tenant.
     */
    Page<AuditLog> findByCompanyIdOrderByTimestampDesc(UUID companyId, Pageable pageable);

    /**
     * Recupera tentativas de login falhas por IP em um intervalo —
     * suporta análises de tentativas de força bruta distribuída.
     */
    List<AuditLog> findByIpAddressAndEventTypeAndTimestampAfter(
            String ipAddress,
            String eventType,
            LocalDateTime since
    );

    /**
     * Conta o número de ocorrências de um tipo de evento para um e-mail
     * em um intervalo — útil para alertar sobre múltiplas tentativas falhas
     * em uma mesma conta.
     */
    long countByEmailAndEventTypeAndTimestampAfter(
            String email,
            String eventType,
            LocalDateTime since
    );

    /**
     * Consulta paginada com filtros dinâmicos via {@link Specification}.
     * Utilizada pelo endpoint {@code GET /admin/audit/logs} para suportar
     * combinações arbitrárias de critérios (Req. 5.4).
     */
    Page<AuditLog> findAll(Specification<AuditLog> spec, Pageable pageable);
}
