package com.dumply.service;

import com.dumply.common.dto.InvoiceRequest;
import com.dumply.common.dto.InvoiceStatus;
import com.dumply.model.Customer;
import com.dumply.model.Invoice;
import com.dumply.model.Rental;
import com.dumply.repository.CustomerRepository;
import com.dumply.repository.InvoiceRepository;
import com.dumply.repository.RentalRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Transactional
    public Invoice createInvoice(InvoiceRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        List<Rental> rentals = rentalRepository.findAllById(request.rentalIds());

        if (rentals.isEmpty()) {
            throw new RuntimeException("Nenhum aluguel selecionado");
        }

        for (Rental rental : rentals) {
            if (!rental.getCustomer().getId().equals(customer.getId())) {
                throw new RuntimeException("Aluguel não pertence ao cliente");
            }
            if (rental.getInvoice() != null) {
                throw new RuntimeException("Aluguel já possui fatura");
            }
        }

        Invoice invoice = new Invoice(customer, rentals);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        for (Rental rental : rentals) {
            rental.setInvoice(savedInvoice);
            rentalRepository.save(rental);
        }

        return savedInvoice;
    }

    public List<Rental> getUninvoicedRentals(Long customerId) {
        return rentalRepository.findByCustomerIdAndInvoiceIsNull(customerId);
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

    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

}
