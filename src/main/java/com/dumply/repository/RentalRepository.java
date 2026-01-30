package com.dumply.repository;

import com.dumply.common.dto.RentalStatus;
import com.dumply.model.Rental;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {
    @EntityGraph(attributePaths = {"customer", "equipment", "invoice"})
    Page<Rental> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "equipment", "invoice"})
    List<Rental> findByStatus(RentalStatus status);
    List<Rental> findByCustomerIdAndInvoiceIsNull(Long customerId);
}
