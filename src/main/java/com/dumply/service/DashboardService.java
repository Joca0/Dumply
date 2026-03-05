package com.dumply.service;

import com.dumply.common.dto.DashboardStatsDTO;
import com.dumply.repository.InvoiceRepository;
import com.dumply.repository.RentalRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Transactional
public class DashboardService extends TenantAwareService{

    @Autowired private RentalRepository rentalRepository;

    @Autowired private InvoiceRepository invoiceRepository;

    public DashboardStatsDTO getDashboardStats() {
        UUID companyId = getCurrentCompany().getId();

        Long active = rentalRepository.countActiveRentals(companyId);
        Long pending = invoiceRepository.countPendingInvoices(companyId);
        Long scheduled = rentalRepository.countScheduledRentals(companyId);

        return new DashboardStatsDTO(active, pending, scheduled);
    }
}
