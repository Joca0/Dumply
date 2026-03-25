package com.dumply.repository;

import com.dumply.common.dto.EquipmentAutocomplete;
import com.dumply.model.Equipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EquipmentRepository extends JpaRepository<Equipment, Long>, JpaSpecificationExecutor<Equipment> {

    @Override
    Page<Equipment> findAll(Pageable pageable);

    Optional<Equipment> findByIdAndCompanyId(Long id, UUID companyId);

    @Query("""
    SELECT new com.dumply.common.dto.EquipmentAutocomplete(e.id, e.name, e.serialNumber)
    FROM Equipment e
    WHERE e.company.id = :companyId
      AND e.status = com.dumply.common.dto.EquipmentStatus.AVAILABLE
      AND (
           LOWER(e.name) LIKE LOWER(CONCAT('%', :q, '%'))
        OR e.serialNumber LIKE CONCAT('%', :q, '%')
      )
    ORDER BY e.name
""")
    List<EquipmentAutocomplete> searchForSelect(
            @Param("q") String q,
            @Param("companyId") UUID companyId
    );
}
