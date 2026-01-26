package com.dumply.common.dto;

import java.math.BigDecimal;

public record RentalMapDTO(
        Long id,
        String equipmentName,
        String customerName,
        Double lat,
        Double lng,
        BigDecimal charge,
        RentalStatus status
) {}
