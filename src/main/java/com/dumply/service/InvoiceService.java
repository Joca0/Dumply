package com.dumply.service;

import com.dumply.common.dto.InvoiceRequest;
import com.dumply.common.dto.InvoiceStatsDTO;
import com.dumply.common.dto.InvoiceStatus;
import com.dumply.model.Customer;
import com.dumply.model.Invoice;
import com.dumply.model.Rental;
import com.dumply.repository.CustomerRepository;
import com.dumply.repository.InvoiceRepository;
import com.dumply.repository.RentalRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    public Page<Invoice> getAllInvoices(String search, String month, InvoiceStatus status, Pageable pageable) {
        Specification<Invoice> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String likeTerm = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("customer").get("fullName")), likeTerm),
                        cb.like(root.get("id").as(String.class), likeTerm)
                ));
            }
            if (month != null && !month.isBlank()) {
                LocalDateTime start = LocalDate.parse(month + "-01").atStartOfDay();
                LocalDateTime end = start.plusMonths(1);
                predicates.add(cb.between(root.get("createdAt"), start, end));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            query.orderBy(
                cb.asc(
                    cb.selectCase(root.get("status"))
                        .when(InvoiceStatus.PENDING, 1)
                        .when(InvoiceStatus.PAID, 2)
                        .when(InvoiceStatus.CANCELLED, 3)
                        .otherwise(4)
                ),
                cb.desc(root.get("createdAt"))
            );

            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return invoiceRepository.findAll(spec, pageable);
    }

    public InvoiceStatsDTO getInvoiceStats() {
        return invoiceRepository.getInvoiceReportStats();
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
