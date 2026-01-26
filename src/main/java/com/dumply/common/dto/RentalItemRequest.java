package com.dumply.common.dto;

import java.math.BigDecimal;

public record RentalItemRequest(Long equipmentId, BigDecimal charge) {
}
