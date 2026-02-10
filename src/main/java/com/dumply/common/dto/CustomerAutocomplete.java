package com.dumply.common.dto;

public record CustomerAutocomplete(
        Long id,
        String fullName,
        String document
) {
}
