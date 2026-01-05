package com.dumply.controller;

import com.dumply.common.InvoiceRequest;
import com.dumply.common.InvoiceStatus;
import com.dumply.model.Invoice;
import com.dumply.model.Rental;
import com.dumply.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
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
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    @GetMapping("/{id}")
    public Invoice getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id);
    }

    @PutMapping("/{id}/status")
    public Invoice updateInvoiceStatus(@PathVariable Long id, @RequestBody InvoiceStatus status) {
        return invoiceService.updateInvoiceStatus(id, status);
    }
}
