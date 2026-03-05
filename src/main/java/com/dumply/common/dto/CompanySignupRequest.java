package com.dumply.common.dto;

public record CompanySignupRequest(
        String companyName,
        String ownerDocuments,
        String ownerName,
        String ownerEmail,
        String ownerPassword
) {
}
