package com.dumply.repository;

import com.dumply.common.dto.InvoiceStatsDTO;
import com.dumply.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = com.dumply.common.dto.InvoiceStatus.PENDING")
    Long countPendingInvoices();

    @Query("""
    SELECT new com.dumply.common.dto.InvoiceStatsDTO(
        SUM(CASE WHEN i.status IN (com.dumply.common.dto.InvoiceStatus.PENDING, com.dumply.common.dto.InvoiceStatus.PAID) THEN i.totalAmount ELSE 0 END),
        SUM(CASE WHEN i.status = com.dumply.common.dto.InvoiceStatus.PENDING THEN i.totalAmount ELSE 0 END),
        SUM(CASE WHEN i.status = com.dumply.common.dto.InvoiceStatus.PAID THEN i.totalAmount ELSE 0 END),
        COUNT(CASE WHEN i.status = com.dumply.common.dto.InvoiceStatus.PENDING THEN 1 ELSE NULL END)
    )
    FROM Invoice i
""")
    InvoiceStatsDTO getInvoiceReportStats();

}
