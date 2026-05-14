package com.dumply.controller;

import com.dumply.common.dto.*;
import com.dumply.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@RequestBody LoginRequestDTO body,
                                             HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(body, httpRequest));
    }

    @PatchMapping("/complete-welcome")
    public ResponseEntity<ProfileDTO> completeWelcome(
            @RequestBody CompleteWelcomeRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.completeWelcome(request, httpRequest));
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileDTO> me() {
        return ResponseEntity.ok(authService.getLoggedUser());
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@RequestBody RegisterRequestDTO body) {
        return ResponseEntity.ok(authService.register(body));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        authService.logout(httpRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequest request,
                                               HttpServletRequest httpRequest) {
        authService.forgotPassword(request, httpRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest request,
                                              HttpServletRequest httpRequest) {
        authService.resetPassword(request, httpRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request,
                                               HttpServletRequest httpRequest) {
        authService.changePassword(request, httpRequest);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/2fa/verify")
    public ResponseEntity<ResponseDTO> verify2FA(@RequestParam String email,
                                                 @RequestParam String code,
                                                 HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.verify2FA(email, Integer.parseInt(code), httpRequest));
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<Map<String, String>> setup2FA() {
        return ResponseEntity.ok(authService.setup2FA());
    }

    @PostMapping("/2fa/confirm")
    public ResponseEntity<Void> confirm2FA(@RequestParam int code,
                                           HttpServletRequest httpRequest) {
        authService.confirmEnable2FA(code, httpRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/2fa/disable/request")
    public ResponseEntity<Void> requestDisable2FA(HttpServletRequest httpRequest) {
        authService.requestDisable2FACode(httpRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/2fa/disable/confirm")
    public ResponseEntity<Void> confirmDisable2FA(@RequestParam String code,
                                                  HttpServletRequest httpRequest) {
        authService.confirmDisable2FA(code, httpRequest);
        return ResponseEntity.ok().build();
    }
}
