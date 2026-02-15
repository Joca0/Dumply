package com.dumply.service;

import com.dumply.config.tenant.TenantContext;
import com.dumply.model.Company;
import com.dumply.repository.CompanyRepository;
import jakarta.persistence.EntityManagerFactory;
import jakarta.transaction.Transactional;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.jpa.EntityManagerFactoryUtils;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Transactional
public abstract class TenantAwareService {

    @Autowired
    protected CompanyRepository companyRepository;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    /** Habilita o filtro de tenant na Session da "transação" atual (a mesma usada nas queries). */
    protected void enableTenantFilterOnCurrentSession() {
        UUID companyId = TenantContext.getCompanyId();
        if (companyId == null) return;
        var em = EntityManagerFactoryUtils.getTransactionalEntityManager(entityManagerFactory);
        if (em != null) {
            em.unwrap(Session.class).enableFilter("companyFilter").setParameter("companyId", companyId);
        }
    }

    protected Company getCurrentCompany() {
        enableTenantFilterOnCurrentSession();
        UUID companyId = TenantContext.getCompanyId();

        if (companyId == null) {
            throw new IllegalStateException("Tenant não resolvido na request");
        }

        return companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalStateException("Empresa não encontrada"));
    }
}
