package com.dumply.common.dto;

/**
 * Finalidades de tratamento de dados pessoais para as quais o titular pode
 * conceder ou revogar consentimento, conforme exigido pelo Art. 8º, §4º da LGPD
 * (vedação a autorizações genéricas) e pelo Req. 4.5 da disciplina de
 * Segurança da Informação.
 *
 * <p>Cada valor do enum representa uma finalidade <b>específica e determinada</b>
 * para a qual o sistema solicita consentimento independente. As finalidades
 * sinalizadas como obrigatórias são indispensáveis à execução do contrato e,
 * caso revogadas, conduzem ao fluxo de exclusão da conta (Req. 4.10).</p>
 */
public enum ConsentPurpose {

    /**
     * Tratamento dos dados pessoais necessários para autenticação,
     * gestão da conta e operação do serviço. <b>Obrigatória.</b>
     */
    AUTHENTICATION(true),

    /**
     * Envio de e-mails transacionais relacionados à segurança da conta
     * (recuperação de senha, código 2FA, alertas de bloqueio). <b>Obrigatória.</b>
     */
    TRANSACTIONAL_EMAIL(true),

    /**
     * Notificações sobre o ciclo de vida do plano contratado da empresa
     * (fim do período de avaliação, renovação, suspensão). <b>Obrigatória.</b>
     */
    TRIAL_NOTIFICATION(true),

    /**
     * Envio de comunicações promocionais, novidades de produto e materiais
     * educativos. <b>Opcional</b> — pode ser revogada a qualquer momento.
     */
    MARKETING(false);

    private final boolean mandatory;

    ConsentPurpose(boolean mandatory) {
        this.mandatory = mandatory;
    }

    /**
     * Indica se a finalidade é indispensável à execução do contrato.
     * Finalidades obrigatórias, quando revogadas, disparam o fluxo de
     * exclusão da conta (Req. 4.10).
     */
    public boolean isMandatory() {
        return mandatory;
    }
}
