package com.dumply.common.dto;

public record CompanySignupRequest(
        String companyName,
        String ownerName,
        String ownerEmail,
        String ownerPassword
) {
}
