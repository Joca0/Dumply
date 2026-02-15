package com.dumply.model;

import com.dumply.common.dto.CompanyStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Column(unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    private CompanyStatus status;

    private LocalDateTime trialEndsAt;

    private LocalDateTime createdAt = LocalDateTime.now();
}
