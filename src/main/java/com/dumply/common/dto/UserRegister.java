package com.dumply.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserRegister(
        String fullName,
        String email,
        String document,
        String password
) {
}
