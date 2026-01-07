package com.dumply.common;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record RentalRequest(
        List<RentalItemRequest> items,
        Long customerId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String fullAddress,
        double latitude,
        double longitude
) {}
