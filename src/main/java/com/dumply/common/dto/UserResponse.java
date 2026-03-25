package com.dumply.common.dto;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        String document,
        Role role
) {
}
