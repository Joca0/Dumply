package com.dumply.common;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RentalRequest(
        Long equipmentId,
        Long customerId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String fullAddress,
        double latitude,
        double longitude,
        BigDecimal charge
) {}
