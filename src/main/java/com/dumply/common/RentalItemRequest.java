package com.dumply.common;

import java.math.BigDecimal;

public record RentalItemRequest(Long equipmentId, BigDecimal charge) {
}
