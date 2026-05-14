package com.dumply.controller;

import com.dumply.service.AuditLogService;
import com.dumply.config.security.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.springframework.context.annotation.Import;
import com.dumply.config.security.SecurityConfig;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.test.context.support.WithMockUser;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(AuditController.class)
@Import(SecurityConfig.class)
@EnableMethodSecurity
@AutoConfigureMockMvc(addFilters = false)
class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuditLogService auditLogService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private com.dumply.config.security.CustomUserDetailsService userDetailsService;

    @MockitoBean
    private com.dumply.config.tenant.TenantHibernateFilter tenantHibernateFilter;

    @MockitoBean
    private com.dumply.config.security.SecurityFilter securityFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void ownerShouldAccessLogs() throws Exception {
        when(auditLogService.search(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/admin/audit/logs")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminShouldAccessLogs() throws Exception {
        when(auditLogService.search(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/admin/audit/logs")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void managerShouldAccessLogs() throws Exception {
        when(auditLogService.search(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/admin/audit/logs")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void userShouldNotAccessLogs() throws Exception {
        mockMvc.perform(get("/admin/audit/logs")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldNotAccessLogsFromAnotherCompany() throws Exception {
        UUID myCompanyId = UUID.randomUUID();
        UUID otherCompanyId = UUID.randomUUID();

        // Simula o contexto da minha empresa
        try (var mockedTenantContext = org.mockito.Mockito.mockStatic(com.dumply.config.tenant.TenantContext.class)) {
            mockedTenantContext.when(com.dumply.config.tenant.TenantContext::getCompanyId).thenReturn(myCompanyId);

            mockMvc.perform(get("/admin/audit/logs")
                    .param("companyId", otherCompanyId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }
    }
}
