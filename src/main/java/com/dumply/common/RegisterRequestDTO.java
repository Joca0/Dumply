package com.dumply.common;

public record RegisterRequestDTO(
        String email,
        String password,
        String fullName,
        Role role,
        String document
) {
}
