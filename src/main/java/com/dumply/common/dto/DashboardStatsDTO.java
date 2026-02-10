package com.dumply.common.dto;

import java.math.BigDecimal;

public record DashboardStatsDTO(
        Long totalActiveRentals,
        Long openInvoicesCount
) {
}
