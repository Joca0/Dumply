package com.dumply.common.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Representação dos dados pessoais do titular para fins de consulta
 * (Art. 18, II da LGPD — direito de acesso). Atende ao Req. 4.8.
 *
 * <p>O campo {@code document} é entregue com mascaramento parcial,
 * em conformidade com o princípio da necessidade (Art. 6º, III da LGPD).
 * Os campos {@code password}, {@code secret2fa}, {@code passwordResetToken}
 * e demais credenciais <b>jamais</b> são incluídos nesta resposta.</p>
 *
 * @param id              identificador interno do titular
 * @param email           e-mail de cadastro
 * @param fullName        nome completo
 * @param document        CPF/CNPJ mascarado (ex.: "***.456.***-00")
 * @param role            papel funcional (ADMIN, USER, DRIVER, ...)
 * @param is2faEnabled    indica se a autenticação de dois fatores está ativa
 * @param firstLogin      indica se ainda não houve aceite no primeiro login
 * @param consentStatus   estado consolidado dos consentimentos por finalidade
 * @param company         contexto multi-tenant ao qual o titular pertence
 */
public record LgpdDataDTO(
        UUID id,
        String email,
        String fullName,
        String document,
        Role role,
        boolean is2faEnabled,
        boolean firstLogin,
        ConsentStatusDTO consentStatus,
        CompanyContextDTO company
) {

    /**
     * Subobjeto representando o tenant (empresa) do titular,
     * exibido em forma reduzida — apenas o estritamente necessário
     * para o titular reconhecer o contexto organizacional do tratamento.
     */
    public record CompanyContextDTO(
            UUID id,
            String name,
            String slug,
            String status,
            LocalDateTime createdAt
    ) {}
}
