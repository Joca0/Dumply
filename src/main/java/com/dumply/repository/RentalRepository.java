package com.dumply.repository;

import com.dumply.common.dto.RentalStatus;
import com.dumply.model.Equipment;
import com.dumply.model.Rental;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long>, JpaSpecificationExecutor<Rental> {
    @EntityGraph(attributePaths = {"customer", "equipment", "invoice"})
    Page<Rental> findAll(Pageable pageable);

    @Query("select count(r) from Rental r where r.status = com.dumply.common.dto.RentalStatus.ACTIVE")
    Long countActiveRentals();

    @Query("""
    select r
    from Rental r
    where r.status = com.dumply.common.dto.RentalStatus.SCHEDULED
""")
    Page<Rental> findScheduledRentals(Pageable pageable);

    boolean existsByEquipmentAndStatus(Equipment equipment, RentalStatus status);

    @EntityGraph(attributePaths = {"customer", "equipment", "invoice"})
    List<Rental> findByStatus(RentalStatus status);
    @Query("SELECT r FROM Rental r WHERE r.customer.id = :customerId AND r.invoice IS NULL AND r.status IN (com.dumply.common.dto.RentalStatus.ACTIVE, com.dumply.common.dto.RentalStatus.FINISHED)")
    List<Rental> findByCustomerIdAndInvoiceIsNull(@Param("customerId") Long customerId);
}
