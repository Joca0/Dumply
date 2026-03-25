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
import java.util.Optional;
import java.util.UUID;

public interface RentalRepository extends JpaRepository<Rental, Long>, JpaSpecificationExecutor<Rental> {

    Optional<Rental> findByIdAndCompanyId(Long id, UUID companyId);
    @EntityGraph(attributePaths = {"customer", "equipment", "invoice"})
    Page<Rental> findAll(Pageable pageable);

    @Query("""
    select count(r)
    from Rental r
    where r.status = com.dumply.common.dto.RentalStatus.ACTIVE
      and r.company.id = :companyId
""")
    Long countActiveRentals(@Param("companyId") UUID companyId);

    @Query("""
    select count(r)
    from Rental r
    where r.status = com.dumply.common.dto.RentalStatus.SCHEDULED
      and r.company.id = :companyId
""")
    Long countScheduledRentals(@Param("companyId") UUID companyId);

    @Query("""
    select r
    from Rental r
    where r.status = com.dumply.common.dto.RentalStatus.SCHEDULED
      and r.company.id = :companyId
""")
    Page<Rental> findScheduledRentals(
            @Param("companyId") UUID companyId,
            Pageable pageable
    );

    @Query("""
    select count(r) > 0
    from Rental r
    where r.equipment = :equipment
      and r.status = :status
      and r.company.id = :companyId
""")
    boolean existsActiveRentalForCompany(
            @Param("equipment") Equipment equipment,
            @Param("status") RentalStatus status,
            @Param("companyId") UUID companyId
    );

    @Query("""
    select r
    from Rental r
    where r.status = :status
      and r.company.id = :companyId
""")
    List<Rental> findByStatus(
            @Param("status") RentalStatus status,
            @Param("companyId") UUID companyId
    );

    @Query("SELECT r FROM Rental r WHERE r.customer.id = :customerId AND r.company.id = :companyId AND r.invoice IS NULL AND r.status IN (com.dumply.common.dto.RentalStatus.ACTIVE, com.dumply.common.dto.RentalStatus.FINISHED)")
    List<Rental> findByCustomerIdAndInvoiceIsNull(@Param("customerId") Long customerId, @Param("companyId") UUID companyId);

    @EntityGraph(attributePaths = {"customer", "equipment", "driver"})
    Page<Rental> findByDriverIdAndCompanyId(UUID driverId, UUID companyId, Pageable pageable);

}
