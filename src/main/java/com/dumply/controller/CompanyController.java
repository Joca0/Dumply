package com.dumply.controller;

import com.dumply.common.dto.CompanySignupRequest;
import com.dumply.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody CompanySignupRequest request) {
        companyService.createCompanyWithOwner(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<Void> createCompany(@RequestBody CompanySignupRequest request) {
        companyService.createCompany(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
