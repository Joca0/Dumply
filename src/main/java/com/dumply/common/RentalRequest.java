package com.dumply.common;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record RentalRequest(
        Long equipmentId,
        Long customerId,
        LocalDate startDate,
        LocalDate endDate,
        String fullAddress,
        double latitude,
        double longitude,
        BigDecimal charge
) {}
