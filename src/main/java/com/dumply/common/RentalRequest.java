package com.dumply.common;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RentalRequest(
        Long equipmentId,
        Long customerId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Double latitude,
        Double longitude,
        BigDecimal charge
) {}
