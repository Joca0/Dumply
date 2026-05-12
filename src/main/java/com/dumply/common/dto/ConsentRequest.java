package com.dumply.common.dto;

/**
 * Payload utilizado para registrar a concessão de consentimento do titular
 * para uma finalidade específica.
 *
 * @param purpose finalidade do tratamento (ex.: {@code MARKETING})
 * @param version versão da Política de Privacidade aceita (ex.: {@code "v1.0"})
 */
public record ConsentRequest(
        ConsentPurpose purpose,
        String version
) {}
