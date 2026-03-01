package com.dumply.common.dto;

import java.util.Map;

public record ErrorResponse(
        int status,
        String message,
        long timestamp,
        Map<String, String> errors
) {}
