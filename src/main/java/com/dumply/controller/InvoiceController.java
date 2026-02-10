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
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping
    public Invoice createInvoice(@RequestBody InvoiceRequest request) {
        return invoiceService.createInvoice(request);
    }

    @GetMapping("/uninvoiced/{customerId}")
    public List<Rental> getUninvoicedRentals(@PathVariable Long customerId) {
        return invoiceService.getUninvoicedRentals(customerId);
    }

    @GetMapping
    public Page<Invoice> getAllInvoices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) InvoiceStatus status,
            @PageableDefault(size = 10)
            @SortDefault.SortDefaults({
                    @SortDefault(sort = "status", direction = Sort.Direction.ASC),
                    @SortDefault(sort = "createdAt", direction = Sort.Direction.DESC)
            }) Pageable pageable) {
        return invoiceService.getAllInvoices(search, month, status, pageable);
    }

    @GetMapping("/stats")
    public InvoiceStatsDTO getInvoiceStats() {
        return invoiceService.getInvoiceStats();
    }

    @GetMapping("/{id}")
    public Invoice getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id);
    }

    @PutMapping("/{id}/status")
    public Invoice updateInvoiceStatus(@PathVariable Long id, @RequestBody InvoiceStatus status) {
        return invoiceService.updateInvoiceStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }
}
