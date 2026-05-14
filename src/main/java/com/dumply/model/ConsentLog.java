package com.dumply.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidade de auditoria de manifestações de consentimento do titular dos dados.
 *
 * <p>Esta tabela é <b>append-only</b>: cada GRANT ou REVOKE produz um novo registro,
 * nunca uma atualização do registro anterior. Essa característica é fundamental
 * para atender ao princípio da prestação de contas (Art. 6º, X da LGPD) e ao
 * Req. 4.7 da disciplina (registro de data e versão do consentimento).</p>
 *
 * <p>O repositório associado ({@link com.dumply.repository.ConsentLogRepository})
 * propositalmente <b>não expõe métodos de update ou delete</b>, garantindo a
 * imutabilidade no nível da camada de persistência.</p>
 *
 * @see com.dumply.repository.ConsentLogRepository
 */
@Entity
@Table(name = "consent_log",
       indexes = {
               @Index(name = "idx_consent_log_user_id", columnList = "user_id"),
               @Index(name = "idx_consent_log_timestamp", columnList = "timestamp")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConsentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    /**
     * Referência ao usuário titular do consentimento.
     * Mantemos apenas o UUID (e não @ManyToOne) para preservar o histórico
     * mesmo após anonimização ou eventual exclusão do usuário (Req. 4.10).
     */
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    /**
     * Ação registrada: {@code GRANT} (concessão) ou {@code REVOKE} (revogação).
     */
    @Column(nullable = false, updatable = false, length = 20)
    private String action;

    /**
     * Finalidade específica do consentimento — exemplos:
     * {@code AUTHENTICATION}, {@code MARKETING}, {@code TRANSACTIONAL_EMAIL},
     * {@code TRIAL_NOTIFICATION}. Atende ao Req. 4.5 (consentimento associado
     * à finalidade) e ao Art. 8º, §4º da LGPD (vedação a autorizações genéricas).
     */
    @Column(nullable = false, updatable = false, length = 50)
    private String purpose;

    /**
     * Versão da Política de Privacidade vigente no momento da manifestação
     * (ex.: {@code "v1.0"}). Atende ao Req. 4.7.
     */
    @Column(nullable = false, updatable = false, length = 20)
    private String version;

    /**
     * Endereço IP de origem da manifestação — utilizado como evidência probatória.
     */
    @Column(name = "ip_address", updatable = false, length = 45)
    private String ipAddress;

    /**
     * Cabeçalho User-Agent do dispositivo do titular — utilizado como
     * evidência adicional para fins de auditoria.
     */
    @Column(name = "user_agent", updatable = false, length = 500)
    private String userAgent;

    /**
     * Carimbo temporal da manifestação. Preenchido automaticamente no momento
     * da persistência por meio do callback {@link #onCreate()}.
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    /**
     * Construtor de conveniência usado pelo {@code LgpdService} para registrar
     * eventos de consentimento de forma concisa.
     */
    public ConsentLog(UUID userId, String action, String purpose, String version,
                      String ipAddress, String userAgent) {
        this.userId = userId;
        this.action = action;
        this.purpose = purpose;
        this.version = version;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
}
