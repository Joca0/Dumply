package com.dumply.common.dto;

/**
 * Payload para solicitação de exclusão (anonimização) da conta do titular,
 * em atendimento ao Art. 18, VI da LGPD — Req. 4.10.
 *
 * <p>A operação exige <b>confirmação dupla</b> como salvaguarda contra
 * exclusões acidentais:
 * <ul>
 *   <li>{@code password} — senha atual do titular</li>
 *   <li>{@code confirmation} — string literal {@code "EXCLUIR"}</li>
 * </ul></p>
 *
 * @param password     senha atual para autorização adicional
 * @param confirmation deve ser exatamente {@code "EXCLUIR"}
 */
public record AccountDeletionRequest(
        String password,
        String confirmation
) {
    /**
     * String exigida no campo {@code confirmation} para autorizar a exclusão.
     */
    public static final String EXPECTED_CONFIRMATION = "EXCLUIR";
}
