package com.dumply.common.dto;

import java.math.BigDecimal;

public record InvoiceStatsDTO(
        BigDecimal totalFaturado,
        BigDecimal totalPendente,
        BigDecimal totalPago,
        Long quantidadePendentes
) {}