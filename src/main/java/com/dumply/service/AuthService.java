package com.dumply.service;

import com.dumply.common.dto.LoginRequestDTO;
import com.dumply.common.dto.ProfileDTO;
import com.dumply.common.dto.RegisterRequestDTO;
import com.dumply.common.dto.ResponseDTO;
import com.dumply.common.exception.BusinessException;
import com.dumply.config.security.TokenService;
import com.dumply.model.User;
import com.dumply.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public ResponseDTO login(LoginRequestDTO body) {
        User user = userRepository.findByEmail(body.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciais Inválidas"));

        if (!passwordEncoder.matches(body.password(), user.getPassword())) {
            throw new BadCredentialsException("Credenciais Inválidas");
        }

        return new ResponseDTO(tokenService.generateToken(user));
    }


    public ProfileDTO getLoggedUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        return new ProfileDTO(
                user.getFullName(),
                user.getRole(),
                user.isFirstLogin()
        );
    }

    @Transactional
    public ProfileDTO completeWelcome() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        user.setFirstLogin(false);
        return new ProfileDTO(
                user.getFullName(),
                user.getRole(),
                user.isFirstLogin()
        );
    }

    public ResponseDTO register(RegisterRequestDTO body) {
        if (userRepository.existsByEmailGlobal(body.email())) {
            throw new BusinessException("Usuário já existe");
        }

        User user = new User();
        user.setEmail(body.email());
        user.setPassword(passwordEncoder.encode(body.password()));
        user.setDocument(body.document());
        user.setFullName(body.fullName());
        user.setRole(body.role());

        userRepository.save(user);

        return new ResponseDTO(tokenService.generateToken(user));
    }
}