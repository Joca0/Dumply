package com.dumply.common.dto;

public record ResponseDTO(
        String token,
        boolean requires2FA,
        String email
) {
    public ResponseDTO(String token) {
        this(token, false, null);
    }
}
