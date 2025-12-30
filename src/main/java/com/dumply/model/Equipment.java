package com.dumply.model;

import com.dumply.common.EquipmentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "equipments")
@Getter
@Setter
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String serialNumber;
    private String category;
    private EquipmentStatus status;

    public Equipment() {

    }

    public Equipment(String name, String serialNumber, String category, EquipmentStatus status) {
        this.name = name;
        this.serialNumber = serialNumber;
        this.category = category;
        this.status = status;
    }
}
