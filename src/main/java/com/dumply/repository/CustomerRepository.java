package com.dumply.repository;

import com.dumply.common.dto.CustomerAutocomplete;
import com.dumply.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    @Override
    Page<Customer> findAll(Pageable pageable);

    Optional<Customer> findByIdAndCompanyId(Long id, UUID companyId);

    @Query("""
    SELECT new com.dumply.common.dto.CustomerAutocomplete(c.id, c.fullName, c.document)
    FROM Customer c
    WHERE c.company.id = :companyId
      AND (
           LOWER(c.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
        OR c.document LIKE CONCAT('%', :q, '%')
      )
    ORDER BY c.fullName
""")
    List<CustomerAutocomplete> searchForSelect(
            @Param("q") String q,
            @Param("companyId") UUID companyId
    );
}
