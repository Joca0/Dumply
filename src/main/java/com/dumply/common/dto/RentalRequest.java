package com.dumply.common.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RentalRequest(
        List<RentalItemRequest> items,
        Long customerId,
        UUID driverId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String fullAddress,
        Double latitude,
        Double longitude
) {}
