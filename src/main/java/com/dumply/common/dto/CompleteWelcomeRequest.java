package com.dumply.common.dto;

/**
 * Payload exigido para completar o fluxo de boas-vindas (primeiro login) do
 * titular. Atende ao Req. 4.4 (registro explícito de consentimento) — sem
 * o aceite, o usuário não consegue prosseguir no uso do sistema.
 *
 * <p>O campo {@code consentGiven} deve ser obrigatoriamente {@code true};
 * caso contrário, o backend responde com {@code 400 Bad Request}, com a
 * mensagem padronizada {@code "Aceite dos termos é obrigatório"}.</p>
 *
 * <p>O campo {@code consentVersion} identifica a versão da Política de
 * Privacidade exibida ao titular no momento do aceite, atendendo ao Req. 4.7.</p>
 *
 * @param consentGiven   manifestação explícita de aceite (deve ser {@code true})
 * @param consentVersion versão da política aceita (ex.: {@code "v1.0"})
 */
public record CompleteWelcomeRequest(
        Boolean consentGiven,
        String consentVersion
) {}
