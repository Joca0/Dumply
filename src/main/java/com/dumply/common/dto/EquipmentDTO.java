package com.dumply.common.dto;

public record EquipmentDTO (
        String name,
        String serialNumber,
        String category,
        EquipmentStatus status
) {}
