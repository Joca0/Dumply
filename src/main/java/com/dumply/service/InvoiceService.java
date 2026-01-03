package com.dumply.service;

import com.dumply.common.InvoiceStatus;
import com.dumply.model.Invoice;
import com.dumply.model.Rental;
import com.dumply.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    //Sem PostMapping porque é criado um Invoice ao fazer criar um aluguel
    public Invoice createInvoiceForRental(Rental rental) {
        Invoice invoice = new Invoice(rental.getCustomer(), Collections.singletonList(rental));
        rental.setInvoice(invoice);
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fatura não encontrada"));

    }

    public Invoice updateInvoiceStatus(Long id, InvoiceStatus newStatus) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoice.setStatus(newStatus);
                    return invoiceRepository.save(invoice);
                })
                .orElseThrow(() -> new RuntimeException("Fatura não encontrada"));
    }

}
