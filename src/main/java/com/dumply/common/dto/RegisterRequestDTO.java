package com.dumply.common.dto;

public record RegisterRequestDTO(
        String email,
        String password,
        String fullName,
        Role role,
        String document
) {
}
