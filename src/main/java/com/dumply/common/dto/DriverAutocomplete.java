package com.dumply.common.dto;

import java.util.UUID;

public record DriverAutocomplete(
        UUID id,
        String fullName,
        String document
) {
}
