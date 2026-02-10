package com.dumply.service;

import com.dumply.common.dto.DashboardStatsDTO;
import com.dumply.repository.InvoiceRepository;
import com.dumply.repository.RentalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    @Autowired private RentalRepository rentalRepository;
    @Autowired private InvoiceRepository invoiceRepository;

    public DashboardStatsDTO getDashboardStats() {
        Long active = rentalRepository.countActiveRentals();
        Long pending = invoiceRepository.countPendingInvoices();

        return new DashboardStatsDTO(active, pending);
    }
}
