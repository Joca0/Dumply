package com.dumply.common.dto;

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
