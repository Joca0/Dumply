package com.dumply.common.dto;

/**
 * Tipos de eventos de segurança registrados na tabela {@code audit_log}.
 *
 * <p>Centraliza os identificadores de evento para evitar inconsistências
 * entre chamadores. Cada valor representa uma ação relevante para a
 * postura de segurança e privacidade da aplicação, em atendimento aos
 * Reqs. 5.1, 5.2, 2.6 e 2.7 da disciplina.</p>
 */
public enum AuditEventType {

    // ----- Autenticação primária (Req. 5.1) -----
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    ACCOUNT_LOCKED,
    LOGOUT,

    // ----- Autenticação 2FA (Req. 5.2) -----
    TWO_FA_SUCCESS,
    TWO_FA_FAIL,
    TWO_FA_ENABLED,
    TWO_FA_DISABLED,
    TWO_FA_DISABLE_REQUESTED,

    // ----- Gestão de senha (Reqs. 2.6 e 2.7) -----
    PASSWORD_RESET_REQUEST,
    PASSWORD_RESET_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_CHANGED,

    // ----- Consentimento LGPD (Reqs. 4.4 a 4.7) -----
    CONSENT_GRANTED,
    CONSENT_REVOKED,

    // ----- Direitos do titular (Reqs. 4.8 a 4.10) -----
    DATA_ACCESSED,
    DATA_EXPORTED,
    ACCOUNT_DELETED
}
