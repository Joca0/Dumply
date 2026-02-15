package com.dumply.config.tenant;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TenantContext {

    private static final ThreadLocal<UUID> COMPANY_ID = new ThreadLocal<>();

    public static void setCompanyId(UUID companyId) {
        COMPANY_ID.set(companyId);
    }

    public static UUID getCompanyId() {
        return COMPANY_ID.get();
    }

    public static void clear() {
        COMPANY_ID.remove();
    }
}
