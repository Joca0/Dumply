package com.dumply.service;

import com.dumply.common.dto.EquipmentDTO;
import com.dumply.model.Equipment;
import com.dumply.repository.EquipmentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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

    //Método criado para injetar vários equipamentos de uma vez
    @Transactional
    public void saveAllItems(List<EquipmentDTO> dtos) {
        List<Equipment> entidades = dtos.stream()
                .map(dto -> {

                    Equipment entity = new Equipment();

                    entity.setName(dto.name());
                    entity.setSerialNumber(dto.serialNumber());
                    entity.setCategory(dto.category());
                    entity.setStatus(dto.status());
                    return entity;
                })
                .collect(Collectors.toList());

        equipmentRepository.saveAll(entidades);
    }

    public void deleteEquipment(Long equipmentId) {
        equipmentRepository.deleteById(equipmentId);
    }
}
