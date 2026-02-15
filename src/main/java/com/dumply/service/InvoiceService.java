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
@Transactional
public class InvoiceService extends TenantAwareService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Transactional
    public Invoice createInvoice(InvoiceRequest request) {
        enableTenantFilterOnCurrentSession();
        Customer customer = customerRepository.findByIdAndCompanyId(request.customerId(), getCurrentCompany().getId())
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
        invoice.setCompany(getCurrentCompany());
        Invoice savedInvoice = invoiceRepository.save(invoice);

        for (Rental rental : rentals) {
            rental.setInvoice(savedInvoice);
            rentalRepository.save(rental);
        }

        return savedInvoice;
    }

    @Transactional
    public List<Rental> getUninvoicedRentals(Long customerId) {
        enableTenantFilterOnCurrentSession();
        return rentalRepository.findByCustomerIdAndInvoiceIsNull(customerId);
    }

    @Transactional
    public Page<Invoice> getAllInvoices(String search, String month, InvoiceStatus status, Pageable pageable) {
        enableTenantFilterOnCurrentSession();
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
        enableTenantFilterOnCurrentSession();
        return invoiceRepository.getInvoiceReportStats(getCurrentCompany().getId());
    }

    public Invoice getInvoiceById(Long id) {
        enableTenantFilterOnCurrentSession();
        return invoiceRepository.findByIdAndCompanyId(id, getCurrentCompany().getId())
                .orElseThrow(() -> new RuntimeException("Fatura não encontrada"));



    }

    public Invoice updateInvoiceStatus(Long id, InvoiceStatus newStatus) {
        enableTenantFilterOnCurrentSession();
        return invoiceRepository.findByIdAndCompanyId(id, getCurrentCompany().getId())
                .map(invoice -> {
                    invoice.setStatus(newStatus);
                    return invoiceRepository.save(invoice);
                })
                .orElseThrow(() -> new RuntimeException("Fatura não encontrada"));
    }

    public void deleteInvoice(Long id) {
        enableTenantFilterOnCurrentSession();
        Invoice inv = invoiceRepository.findByIdAndCompanyId(id, getCurrentCompany().getId())
                .orElseThrow(() -> new RuntimeException("Fatura não encontrada"));
        invoiceRepository.delete(inv);
    }

}
