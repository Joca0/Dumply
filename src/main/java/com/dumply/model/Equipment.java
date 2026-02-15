package com.dumply.model;

import com.dumply.common.dto.EquipmentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.util.UUID;

@Entity
@Table(name = "equipments")
@Getter
@Setter
@Filter(
        name = "companyFilter",
        condition = "company_id = :companyId"
)
public class Equipment extends CompanySuperEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String serialNumber;
    private String category;
    private EquipmentStatus status;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Company company;

    public Equipment() {

    }

    public Equipment(String name, String serialNumber, String category, EquipmentStatus status) {
        this.name = name;
        this.serialNumber = serialNumber;
        this.category = category;
        this.status = status;
    }
}
