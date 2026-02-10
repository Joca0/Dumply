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

public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    @Override
    Page<Customer> findAll(Pageable pageable);

    @Query("""
    SELECT new com.dumply.common.dto.CustomerAutocomplete(c.id, c.fullName, c.document)
    FROM Customer c
    WHERE LOWER(c.fullName) LIKE %:q%
       OR c.document LIKE %:q%
    ORDER BY c.fullName
""")
    List<CustomerAutocomplete> searchForSelect(@Param("q") String q);
}
