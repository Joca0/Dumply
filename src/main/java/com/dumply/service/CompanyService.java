package com.dumply.service;

import com.dumply.common.dto.CompanySignupRequest;
import com.dumply.common.dto.CompanyStatus;
import com.dumply.common.dto.Role;
import com.dumply.model.Company;
import com.dumply.model.User;
import com.dumply.repository.CompanyRepository;
import com.dumply.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;

@Service
public class CompanyService extends TenantAwareService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void createCompanyWithOwner(CompanySignupRequest request) {

        Company company = new Company();
        company.setName(request.companyName());
        company.setStatus(CompanyStatus.TRIAL);
        company.setTrialEndsAt(LocalDateTime.now().plusMonths(2));

        companyRepository.save(company);

        User owner = new User();
        owner.setFullName(request.ownerName());
        owner.setEmail(request.ownerEmail());
        owner.setPassword(passwordEncoder.encode(request.ownerPassword()));
        owner.setRole(Role.OWNER);
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
}
