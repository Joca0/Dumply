package com.dumply.config.security;

import com.dumply.config.tenant.TenantContext;
import com.dumply.model.User;
import com.dumply.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = recoverToken(request);

        if (token != null) {
            try {
                var decodedJWT = tokenService.validateToken(token);

                String email = decodedJWT.getSubject();
                UUID companyId = decodedJWT.getClaim("companyId").as(UUID.class);
                String role = decodedJWT.getClaim("role").asString();

                TenantContext.setCompanyId(companyId);

                // Buscar por email + companyId para evitar vazamento entre tenants (mesmo email em empresas diferentes)
                User user = userRepository.findByEmailAndCompanyId(email, companyId)
                        .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

                // Garantir que o usuário pertence à empresa do token (defesa em profundidade)
                if (!user.getCompany().getId().equals(companyId)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("Forbidden");
                    return;
                }



                var authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role)
                );

                var userDetails =
                        new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);

                var authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception ex) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Unauthorized");
                return;
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // MUITO IMPORTANTE
            TenantContext.clear();
        }
    }

    private String recoverToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.substring(7);
    }
}
