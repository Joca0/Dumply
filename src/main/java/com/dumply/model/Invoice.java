package com.dumply.model;

import com.dumply.common.dto.InvoiceStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Getter
@Setter
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("invoice")
    private List<Rental> items = new ArrayList<>();

    private LocalDateTime createdAt;
    
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    public Invoice() {
        this.createdAt = LocalDateTime.now();
        this.status = InvoiceStatus.PENDING;
    }

    public Invoice(Customer customer, List<Rental> items) {
        this();
        this.customer = customer;
        this.items = items;
        calculateTotal();
    }

    public void calculateTotal() {
        if (items == null || items.isEmpty()) {
            this.totalAmount = BigDecimal.ZERO;
            return;
        }
        this.totalAmount = items.stream()
                .map(Rental::getCharge)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

