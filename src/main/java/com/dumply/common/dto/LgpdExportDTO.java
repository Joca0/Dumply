package com.dumply.common.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Pacote de exportação de dados do titular em formato interoperável (JSON),
 * em atendimento ao direito de portabilidade (Art. 18, V da LGPD — Req. 4.9).
 *
 * <p>Diferentemente do {@link LgpdDataDTO} (consulta), este DTO entrega o
 * {@code document} em <b>texto pleno</b>, pois trata-se de uma exportação
 * voltada à transferência dos próprios dados do titular para outro fornecedor —
 * o mascaramento seria contraproducente neste contexto.</p>
 *
 * @param schemaVersion    versão do schema deste pacote de exportação
 * @param exportedAt       carimbo temporal da geração da exportação
 * @param subject          dados pessoais do titular
 * @param companyContext   contexto multi-tenant
 * @param consentHistory   histórico completo de manifestações de consentimento
 * @param securityEvents   resumo de eventos relevantes de segurança
 */
public record LgpdExportDTO(
        String schemaVersion,
        LocalDateTime exportedAt,
        SubjectDTO subject,
        CompanyDTO companyContext,
        List<ConsentEventDTO> consentHistory,
        SecuritySummaryDTO securityEvents
) {

    public record SubjectDTO(
            UUID id,
            String email,
            String fullName,
            String document,
            Role role,
            boolean is2faEnabled
    ) {}

    public record CompanyDTO(
            UUID id,
            String name,
            String slug,
            String status,
            LocalDateTime createdAt
    ) {}

    public record ConsentEventDTO(
            UUID id,
            String action,
            String purpose,
            String version,
            String ipAddress,
            String userAgent,
            LocalDateTime timestamp
    ) {}

    public record SecuritySummaryDTO(
            int failedLoginAttempts,
            LocalDateTime locktime,
            boolean accountNonLocked,
            boolean is2faEnabled
    ) {}
}
