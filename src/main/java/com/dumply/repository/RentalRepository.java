package com.dumply.repository;

import com.dumply.common.RentalStatus;
import com.dumply.model.Rental;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByStatus(RentalStatus status);
    List<Rental> findByCustomerIdAndInvoiceIsNull(Long customerId);
}
