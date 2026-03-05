package com.dumply.config;

import com.dumply.common.dto.CompanyStatus;
import com.dumply.common.dto.Role;
import com.dumply.model.Company;
import com.dumply.model.User;
import com.dumply.repository.CompanyRepository;
import com.dumply.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevDataLoader implements CommandLineRunner {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (userRepository.findByEmail("admin@dumply.dev").isPresent()) {
            return;
        }

        Company company = new Company();
        company.setName("Dumply DEV");
        company.setStatus(CompanyStatus.CONFIRMED);
        company.setTrialEndsAt(null);

        companyRepository.save(company);

        User admin = new User();
        admin.setFullName("Dumply Admin");
        admin.setEmail("admin@dumply.dev");
        admin.setFirstLogin(true);
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setCompany(company);

        userRepository.save(admin);
    }
}
