package com.dumply.model;

import com.dumply.common.dto.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"company_id", "document", "email"})
        }
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    private String email;

    private String fullName;

    private boolean firstLogin = true;

    private String document;

    private String password;

    private String secret2fa;

    private boolean is2faEnabled = false;

    private int failedLoginAttempts = 0;

    private LocalDateTime locktime;

    private String passwordResetToken;

    private LocalDateTime passwordResetExpiresAt;

    private boolean accountNonLocked = true;

    private String disable2faCode;

    // ============================================================
    //  LGPD — Registro de Consentimento (Req. 4.4, 4.5 e 4.7)
    // ============================================================

    /**
     * Indica se o titular concedeu consentimento explícito para o tratamento
     * de seus dados pessoais. Iniciado como {@code false} — o aceite é obrigatório
     * no primeiro login (vide {@link com.dumply.service.AuthService#completeWelcome}).
     */
    @Column(name = "consent_given", nullable = false)
    private Boolean consentGiven = false;

    /**
     * Carimbo temporal (UTC) do momento em que o titular manifestou o consentimento.
     * Permanece {@code null} enquanto o aceite não for realizado.
     */
    @Column(name = "consent_given_at")
    private LocalDateTime consentGivenAt;

    /**
     * Versão da Política de Privacidade aceita pelo titular (ex.: {@code "v1.0"}).
     * Alterações materiais na política exigem nova manifestação de vontade
     * (re-incremento da versão).
     */
    @Column(name = "consent_version", length = 20)
    private String consentVersion;

    // ============================================================

    @Enumerated(EnumType.STRING)
    private Role role;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

}

