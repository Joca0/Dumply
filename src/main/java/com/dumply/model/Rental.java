package com.dumply.model;

import com.dumply.common.dto.InvoiceStatus;
import com.dumply.common.dto.RentalStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rentals")
@Getter
@Setter
@FilterDef(
        name = "filtroMesAluguel",
        parameters = {
                @ParamDef(name = "startDate", type = LocalDateTime.class),
                @ParamDef(name = "endDate", type = LocalDateTime.class)
        }
)
@Filter(name = "filtroMesAluguel", condition = "startDate BETWEEN :startDate AND :endDate")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    @Enumerated(EnumType.STRING)
    private RentalStatus status;
    @Enumerated(EnumType.STRING)
    private InvoiceStatus invoiceStatus = InvoiceStatus.PENDING;
    private String fullAddress;
    private double latitude;
    private double longitude;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private BigDecimal charge;

    @ManyToOne
    @JoinColumn(name = "invoice_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("items")
    private Invoice invoice;

    public Rental() {

    }

    public Rental(LocalDateTime startDate, LocalDateTime endDate, RentalStatus status, String fullAddress, double latitude, double longitude, Equipment equipment, Customer customer, BigDecimal charge) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.fullAddress = fullAddress;
        this.latitude = latitude;
        this.longitude = longitude;
        this.equipment = equipment;
        this.customer = customer;
        this.charge = charge;
    }
}
