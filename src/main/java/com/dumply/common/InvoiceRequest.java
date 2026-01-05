package com.dumply.common;

import java.util.List;

public record InvoiceRequest(Long customerId, List<Long> rentalIds) {
}
