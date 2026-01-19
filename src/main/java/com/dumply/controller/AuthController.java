package com.dumply.controller;

import com.dumply.common.LoginRequestDTO;
import com.dumply.common.ProfileDTO;
import com.dumply.common.RegisterRequestDTO;
import com.dumply.common.ResponseDTO;
import com.dumply.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@RequestBody LoginRequestDTO body) {
        return ResponseEntity.ok(authService.login(body));
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileDTO> me() {
        return ResponseEntity.ok(authService.getLoggedUser());
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@RequestBody RegisterRequestDTO body) {
        return ResponseEntity.ok(authService.register(body));
    }
}
