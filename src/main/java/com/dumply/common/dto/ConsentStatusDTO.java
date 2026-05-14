package com.dumply.common.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Resposta consolidada do estado de consentimentos do titular.
 *
 * @param consentGiven    indica se o aceite principal foi concedido
 * @param consentGivenAt  carimbo temporal do aceite principal
 * @param consentVersion  versão da política aceita
 * @param activePurposes  finalidades atualmente ativas (último evento foi GRANT)
 * @param revokedPurposes finalidades atualmente revogadas (último evento foi REVOKE)
 */
public record ConsentStatusDTO(
        Boolean consentGiven,
        LocalDateTime consentGivenAt,
        String consentVersion,
        List<ConsentPurpose> activePurposes,
        List<ConsentPurpose> revokedPurposes
) {}
