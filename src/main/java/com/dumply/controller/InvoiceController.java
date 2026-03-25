package com.dumply.controller;

import com.dumply.common.dto.InvoiceRequest;
import com.dumply.common.dto.InvoiceStatsDTO;
import com.dumply.common.dto.InvoiceStatus;
import com.dumply.model.Invoice;
import com.dumply.model.Rental;
import com.dumply.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PreAuthorize("hasAnyRole('ADMIN','OWNER', 'MANAGER')")
    @PostMapping
    public Invoice createInvoice(@RequestBody InvoiceRequest request) {
        return invoiceService.createInvoice(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER', 'MANAGER')")
    @GetMapping("/uninvoiced/{customerId}")
    public List<Rental> getUninvoicedRentals(@PathVariable Long customerId) {
        return invoiceService.getUninvoicedRentals(customerId);
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER', 'MANAGER')")
    @GetMapping
    public Page<Invoice> getAllInvoices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) InvoiceStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        return invoiceService.getAllInvoices(search, month, status, pageable);
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER', 'MANAGER')")
    @GetMapping("/stats")
    public InvoiceStatsDTO getInvoiceStats() {
        return invoiceService.getInvoiceStats();
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER', 'MANAGER')")
    @GetMapping("/{id}")
    public Invoice getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER', 'MANAGER')")
    @PutMapping("/{id}/status")
    public Invoice updateInvoiceStatus(@PathVariable Long id, @RequestBody InvoiceStatus status) {
        return invoiceService.updateInvoiceStatus(id, status);
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER', 'MANAGER')")
    @DeleteMapping("/{id}")
    public void deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }
}
