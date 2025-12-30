package com.dumply.service;

import com.dumply.model.Equipment;
import com.dumply.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    public Equipment createEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    public Equipment findById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));
    }

    public Equipment updateEquipment(Long id, Equipment updatedEquipment) {
        return equipmentRepository.findById(id)
                .map(equipment -> {
                        equipment.setName(updatedEquipment.getName());
                        equipment.setSerialNumber(updatedEquipment.getSerialNumber());
                        equipment.setCategory(updatedEquipment.getCategory());
                        return equipmentRepository.save(equipment);
                })
                .orElseThrow(() -> new RuntimeException("Erro ao atualizar equipamento: " + id));
    }
    public List<Equipment> getAllEquipments() {
        return equipmentRepository.findAll();
    }

    public void deleteEquipment(Long equipmentId) {
        equipmentRepository.deleteById(equipmentId);
    }
}
