package com.dumply.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidade de auditoria de eventos de segurança da aplicação.
 *
 * <p>Registra de forma estruturada e persistente eventos como autenticação,
 * falhas de login, operações 2FA, reset de senha, logout e demais ações
 * relevantes para a postura de segurança do sistema. Substitui (no banco)
 * os logs textuais via SLF4J, que ainda permanecem disponíveis para
 * observabilidade em tempo real.</p>
 *
 * <p>Atende:
 * <ul>
 *   <li>Req. 5.1 — Logs de autenticação registrados;</li>
 *   <li>Req. 5.2 — Logs de falhas e 2FA registrados;</li>
 *   <li>Req. 5.3 — Proteção contra alteração dos logs (campos {@code updatable = false}
 *       e repositório append-only).</li>
 * </ul></p>
 *
 * @see com.dumply.repository.AuditLogRepository
 */
@Entity
@Table(name = "audit_log",
       indexes = {
               @Index(name = "idx_audit_log_user_id", columnList = "user_id"),
               @Index(name = "idx_audit_log_event_type", columnList = "event_type"),
               @Index(name = "idx_audit_log_timestamp", columnList = "timestamp"),
               @Index(name = "idx_audit_log_ip", columnList = "ip_address")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    /**
     * Referência ao usuário associado ao evento. Pode ser {@code null} em casos
     * onde a tentativa de autenticação envolve um e-mail não cadastrado
     * (evita enumeração de usuários).
     */
    @Column(name = "user_id", updatable = false)
    private UUID userId;

    /**
     * Identificador do tenant (empresa) associado ao evento, quando aplicável.
     * Permite filtragens contextuais em arquiteturas multi-tenant.
     */
    @Column(name = "company_id", updatable = false)
    private UUID companyId;

    /**
     * E-mail informado na tentativa. Pode coincidir com o e-mail do usuário
     * referenciado em {@link #userId}, ou ser um e-mail não cadastrado em
     * tentativas inválidas. Armazenado em texto para fins de investigação.
     */
    @Column(updatable = false, length = 320)
    private String email;

    /**
     * Tipo do evento auditado. Valores recomendados (não exaustivos):
     * <ul>
     *   <li>{@code LOGIN_SUCCESS} — login bem-sucedido</li>
     *   <li>{@code LOGIN_FAIL} — credenciais inválidas</li>
     *   <li>{@code ACCOUNT_LOCKED} — bloqueio por força bruta</li>
     *   <li>{@code LOGOUT} — encerramento de sessão</li>
     *   <li>{@code TWO_FA_SUCCESS} — verificação 2FA aprovada</li>
     *   <li>{@code TWO_FA_FAIL} — código 2FA inválido</li>
     *   <li>{@code TWO_FA_ENABLED} — 2FA ativado pelo titular</li>
     *   <li>{@code TWO_FA_DISABLED} — 2FA desativado pelo titular</li>
     *   <li>{@code PASSWORD_RESET_REQUEST} — solicitação de recuperação</li>
     *   <li>{@code PASSWORD_RESET_SUCCESS} — senha redefinida com sucesso</li>
     *   <li>{@code PASSWORD_RESET_FAIL} — falha em redefinição</li>
     *   <li>{@code PASSWORD_CHANGED} — senha alterada pelo titular autenticado</li>
     *   <li>{@code CONSENT_GRANTED} — aceite de termos</li>
     *   <li>{@code CONSENT_REVOKED} — revogação de consentimento</li>
     *   <li>{@code ACCOUNT_DELETED} — exclusão/anonimização da conta</li>
     * </ul>
     */
    @Column(name = "event_type", nullable = false, updatable = false, length = 50)
    private String eventType;

    /**
     * Resultado do evento: {@code SUCCESS} ou {@code FAILURE}.
     * Facilita filtragens rápidas em análise de logs.
     */
    @Column(nullable = false, updatable = false, length = 20)
    private String outcome;

    /**
     * Endereço IP de origem da requisição.
     */
    @Column(name = "ip_address", updatable = false, length = 45)
    private String ipAddress;

    /**
     * Cabeçalho User-Agent do dispositivo de origem.
     */
    @Column(name = "user_agent", updatable = false, length = 500)
    private String userAgent;

    /**
     * Detalhes adicionais do evento em formato livre (recomendado: JSON).
     * Exemplos: mensagem da exceção, número de tentativas falhas, finalidade
     * de consentimento revogada, etc.
     */
    @Column(columnDefinition = "TEXT", updatable = false)
    private String details;

    /**
     * Carimbo temporal do evento. Preenchido automaticamente no momento
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
     * Construtor de conveniência para registros sem detalhes adicionais.
     */
    public AuditLog(UUID userId, UUID companyId, String email, String eventType,
                    String outcome, String ipAddress, String userAgent) {
        this.userId = userId;
        this.companyId = companyId;
        this.email = email;
        this.eventType = eventType;
        this.outcome = outcome;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }

    /**
     * Construtor de conveniência para registros com detalhes adicionais.
     */
    public AuditLog(UUID userId, UUID companyId, String email, String eventType,
                    String outcome, String ipAddress, String userAgent, String details) {
        this(userId, companyId, email, eventType, outcome, ipAddress, userAgent);
        this.details = details;
    }
}
