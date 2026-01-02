package com.dumply.model;

import com.dumply.common.RentalRequest;
import com.dumply.common.RentalStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rentals")
@Getter
@Setter
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private RentalStatus status;
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
