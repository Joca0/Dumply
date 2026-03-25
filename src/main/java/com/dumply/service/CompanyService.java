package com.dumply.service;

import com.dumply.common.dto.*;
import com.dumply.common.exception.BusinessException;
import com.dumply.common.exception.EmailAlreadyExistsException;
import com.dumply.model.Company;
import com.dumply.model.User;
import com.dumply.repository.CompanyRepository;
import com.dumply.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CompanyService extends TenantAwareService {

    private static final int max_test_companies = 3;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void createCompanyWithOwner(CompanySignupRequest request) {
        long companyCount = companyRepository.count();
        if ( companyCount >= max_test_companies) {
            throw new BusinessException("As chaves para o teste fechado acabaram. Logo abriremos uma nova leva de chaves!");
        }
        if(userRepository.existsByEmailGlobal(request.ownerEmail())) {
            throw new EmailAlreadyExistsException("Este e-mail já está em uso.");
        }

        Company company = new Company();
        company.setName(request.companyName());
        company.setStatus(CompanyStatus.TRIAL);
        company.setTrialEndsAt(LocalDateTime.now().plusMonths(2));

        companyRepository.save(company);

        User owner = new User();
        owner.setFullName(request.ownerName());
        owner.setEmail(request.ownerEmail());
        owner.setDocument(request.ownerDocuments());
        owner.setPassword(passwordEncoder.encode(request.ownerPassword()));
        owner.setRole(Role.OWNER);
        owner.setFirstLogin(true);
        owner.setCompany(company);

        userRepository.save(owner);
    }

    public Company createCompany(CompanySignupRequest request) {
        Company company = new Company();
        company.setName(request.companyName());
        company.setStatus(CompanyStatus.TRIAL);
        company.setTrialEndsAt(LocalDateTime.now().plusMonths(2));
        return companyRepository.save(company);
    }

    public Company findById(UUID id) {
        return companyRepository.findById(getCurrentCompany().getId())
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrado"));
    }
}
