package com.dumply.controller;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.dumply.common.dto.AccountDeletionRequest;
import com.dumply.common.dto.ConsentPurpose;
import com.dumply.common.dto.ConsentRequest;
import com.dumply.common.dto.LgpdDataDTO;
import com.dumply.common.dto.LgpdExportDTO;
import com.dumply.config.security.TokenService;
import com.dumply.model.User;
import com.dumply.service.AuthService;
import com.dumply.service.ConsentService;
import com.dumply.service.LgpdService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints REST para o exercício dos direitos do titular previstos no
 * Art. 18 da LGPD, em atendimento aos requisitos 4.5, 4.6, 4.8, 4.9 e 4.10
 * da disciplina de Segurança da Informação.
 *
 * <table>
 *   <caption>Mapeamento Endpoint × Requisito</caption>
 *   <tr><th>Método</th><th>Path</th><th>Requisito</th></tr>
 *   <tr><td>GET</td><td>/lgpd/me/data</td><td>4.8 — Consulta</td></tr>
 *   <tr><td>GET</td><td>/lgpd/me/export</td><td>4.9 — Portabilidade</td></tr>
 *   <tr><td>DELETE</td><td>/lgpd/me</td><td>4.10 — Eliminação</td></tr>
 *   <tr><td>POST</td><td>/lgpd/consent</td><td>4.5 — Concessão por finalidade</td></tr>
 *   <tr><td>DELETE</td><td>/lgpd/consent</td><td>4.6 — Revogação</td></tr>
 * </table>
 *
 * <p>Todos os endpoints recebem {@link HttpServletRequest} para que o
 * {@code LgpdService} possa registrar IP e User-Agent na trilha de auditoria
 * ({@code audit_log}), atendendo ao Req. 5.1 e à evidência probatória
 * exigida pelo princípio da prestação de contas (Art. 6º, X da LGPD).</p>
 *
 * <p>Todos os endpoints exigem JWT válido (não há liberação explícita em
 * {@link com.dumply.config.security.SecurityConfig}, portanto caem na regra
 * {@code anyRequest().authenticated()}).</p>
 */
@RestController
@RequestMapping("/lgpd")
public class LgpdController {

    private final LgpdService lgpdService;
    private final ConsentService consentService;
    private final AuthService authService;
    private final TokenService tokenService;

    public LgpdController(LgpdService lgpdService,
                          ConsentService consentService,
                          AuthService authService,
                          TokenService tokenService) {
        this.lgpdService = lgpdService;
        this.consentService = consentService;
        this.authService = authService;
        this.tokenService = tokenService;
    }

    // ============================================================
    //  Req. 4.8 — Consulta aos dados do titular
    // ============================================================

    @GetMapping("/me/data")
    public ResponseEntity<LgpdDataDTO> getMyData(HttpServletRequest httpRequest) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(lgpdService.getMyData(user, httpRequest));
    }

    // ============================================================
    //  Req. 4.9 — Exportação de dados (portabilidade)
    // ============================================================

    @GetMapping("/me/export")
    public ResponseEntity<LgpdExportDTO> exportMyData(HttpServletRequest httpRequest) {
        User user = authService.getAuthenticatedUser();
        LgpdExportDTO export = lgpdService.exportMyData(user, httpRequest);

        String filename = "dumply_dados_" + user.getId() + ".json";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(export);
    }

    // ============================================================
    //  Req. 4.10 — Eliminação (anonimização estruturada)
    // ============================================================

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(@RequestBody AccountDeletionRequest request,
                                                HttpServletRequest httpRequest) {
        User user = authService.getAuthenticatedUser();

        // Recupera token corrente para blacklistar após a exclusão
        Object credentials = SecurityContextHolder.getContext()
                .getAuthentication()
                .getCredentials();
        String currentToken = credentials != null ? credentials.toString() : null;

        long remainingMs = 0L;
        if (currentToken != null && !currentToken.isBlank()) {
            try {
                DecodedJWT decoded = tokenService.validateToken(currentToken);
                remainingMs = decoded.getExpiresAt().getTime() - System.currentTimeMillis();
            } catch (Exception e) {
                remainingMs = 0L; // token inválido: não há o que blacklistar
            }
        }

        lgpdService.deleteMyAccount(user, request, currentToken, remainingMs, httpRequest);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    //  Req. 4.5 — Concessão de consentimento por finalidade
    // ============================================================

    @PostMapping("/consent")
    public ResponseEntity<Void> grantConsent(@RequestBody ConsentRequest request,
                                             HttpServletRequest httpRequest) {
        User user = authService.getAuthenticatedUser();
        consentService.grantConsent(user, request.purpose(), request.version(), httpRequest);
        return ResponseEntity.ok().build();
    }

    // ============================================================
    //  Req. 4.6 — Revogação de consentimento
    // ============================================================

    @DeleteMapping("/consent")
    public ResponseEntity<Void> revokeConsent(@RequestParam("purpose") ConsentPurpose purpose,
                                              HttpServletRequest httpRequest) {
        User user = authService.getAuthenticatedUser();
        consentService.revokeConsent(user, purpose, httpRequest);
        return ResponseEntity.ok().build();
    }
}
