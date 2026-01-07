package com.dumply.common;

public record EquipmentDTO (
        String name,
        String serialNumber,
        String category,
        EquipmentStatus status
) {}
