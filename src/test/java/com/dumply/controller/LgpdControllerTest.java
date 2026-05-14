package com.dumply.controller;

import com.dumply.common.dto.LgpdDataDTO;
import com.dumply.common.dto.Role;
import com.dumply.config.security.TokenService;
import com.dumply.model.User;
import com.dumply.service.AuthService;
import com.dumply.service.ConsentService;
import com.dumply.service.LgpdService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LgpdController.class)
class LgpdControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LgpdService lgpdService;

    @MockitoBean
    private ConsentService consentService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private com.dumply.config.security.CustomUserDetailsService userDetailsService;

    @MockitoBean
    private com.dumply.config.tenant.TenantHibernateFilter tenantHibernateFilter;

    @MockitoBean
    private com.dumply.config.security.SecurityFilter securityFilter;

    private User testUser;

    @BeforeEach
    void setUp() throws Exception {
        doAnswer(invocation -> {
            HttpServletRequest request = invocation.getArgument(0);
            HttpServletResponse response = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(securityFilter).doFilter(any(), any(), any());

        doAnswer(invocation -> {
            HttpServletRequest request = invocation.getArgument(0);
            HttpServletResponse response = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(tenantHibernateFilter).doFilter(any(), any(), any());

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@test.com");
        when(authService.getAuthenticatedUser()).thenReturn(testUser);
    }

    @Test
    @WithMockUser
    void shouldReturnMyData() throws Exception {
        LgpdDataDTO dataDTO = new LgpdDataDTO(
                testUser.getId(),
                "test@test.com",
                "Test User",
                "***.456.***-00",
                Role.ADMIN,
                false,
                false,
                null,
                null
        );

        when(lgpdService.getMyData(any(), any())).thenReturn(dataDTO);

        mockMvc.perform(get("/lgpd/me/data")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void shouldExportData() throws Exception {
        mockMvc.perform(get("/lgpd/me/export")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void shouldDeleteAccount() throws Exception {
        String jsonPayload = "{\"password\":\"driver123\", \"confirmation\":\"EXCLUIR\"}";

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/lgpd/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isNoContent());
    }
}
