package com.dumply.common;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RentalRequest(
        List<RentalItemRequest> items,
        Long customerId,
        LocalDate startDate,
        LocalDate endDate,
        String fullAddress,
        double latitude,
        double longitude
) {}
