package com.dumply.repository;

import com.dumply.common.dto.InvoiceStatsDTO;
import com.dumply.common.dto.InvoiceStatus;
import com.dumply.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    @Query("""
    SELECT COUNT(i)
    FROM Invoice i
    WHERE i.status = com.dumply.common.dto.InvoiceStatus.PENDING
      AND i.company.id = :companyId
""")
    Long countPendingInvoices(@Param("companyId") UUID companyId);

    @Query("""
    SELECT new com.dumply.common.dto.InvoiceStatsDTO(
        SUM(CASE WHEN i.status IN (com.dumply.common.dto.InvoiceStatus.PENDING, com.dumply.common.dto.InvoiceStatus.PAID) THEN i.totalAmount ELSE 0 END),
        SUM(CASE WHEN i.status = com.dumply.common.dto.InvoiceStatus.PENDING THEN i.totalAmount ELSE 0 END),
        SUM(CASE WHEN i.status = com.dumply.common.dto.InvoiceStatus.PAID THEN i.totalAmount ELSE 0 END),
        COUNT(CASE WHEN i.status = com.dumply.common.dto.InvoiceStatus.PENDING THEN 1 ELSE NULL END)
    )
    FROM Invoice i
        WHERE i.company.id = :companyId
""")
    InvoiceStatsDTO getInvoiceReportStats(@Param("companyId") UUID companyId);

    @EntityGraph(attributePaths = {"items", "items.equipment", "customer"})
    @Query("""
    select i
    from Invoice i
    where i.company.id = :companyId
          and (:status is null or i.status = :status)
    order by
        case i.status
            when com.dumply.common.dto.InvoiceStatus.PENDING then 1
            when com.dumply.common.dto.InvoiceStatus.PAID then 2
            when com.dumply.common.dto.InvoiceStatus.CANCELLED then 3
            else 4
        end,
        i.createdAt desc
""")
    Page<Invoice> getAllInvoices(@Param("status") InvoiceStatus status, Pageable pageable, @Param("companyId") UUID companyId);

    @EntityGraph(attributePaths = {"items", "items.equipment", "customer"})
    Optional<Invoice> findByIdAndCompanyId(Long id, UUID companyId);

    @Override
    @EntityGraph(attributePaths = {"items", "items.equipment", "customer"})
    Page<Invoice> findAll(Specification<Invoice> spec, Pageable pageable);
}
