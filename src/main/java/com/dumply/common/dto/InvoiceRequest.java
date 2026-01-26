package com.dumply.common.dto;

import java.util.List;

public record InvoiceRequest(Long customerId, List<Long> rentalIds) {
}
