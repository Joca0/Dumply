package com.dumply.service;

import com.dumply.common.dto.EquipmentAutocomplete;
import com.dumply.common.dto.EquipmentDTO;
import com.dumply.model.Equipment;
import com.dumply.repository.EquipmentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EquipmentService extends TenantAwareService{

    @Autowired
    private EquipmentRepository equipmentRepository;

    public Equipment createEquipment(Equipment equipment) {
        equipment.setCompany(getCurrentCompany());
        return equipmentRepository.save(equipment);
    }

    public Equipment findById(Long id) {
        return equipmentRepository.findByIdAndCompanyId(id, getCurrentCompany().getId())
                .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));
    }

    public Equipment updateEquipment(Long id, Equipment updatedEquipment) {
        return equipmentRepository.findByIdAndCompanyId(id, getCurrentCompany().getId())
                .map(equipment -> {
                        equipment.setName(updatedEquipment.getName());
                        equipment.setSerialNumber(updatedEquipment.getSerialNumber());
                        equipment.setCategory(updatedEquipment.getCategory());
                        return equipmentRepository.save(equipment);
                })
                .orElseThrow(() -> new RuntimeException("Erro ao atualizar equipamento: " + id));
    }

    public List<EquipmentAutocomplete> searchForSelect(String search) {
        if (search == null || search.isBlank()) {
            return List.of();
        }
        return equipmentRepository.searchForSelect(
                search.toLowerCase(),
                getCurrentCompany().getId()
        );
    }

    public Page<Equipment> getAllEquipments(String search, Pageable pageable) {
        enableTenantFilterOnCurrentSession();
        if ( search == null || search.isBlank()) {
            return equipmentRepository.findAll(pageable);
        }

        Specification<Equipment> spec = (root, query, cb) -> {
            String likeTerm = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), likeTerm),
                    cb.like(cb.lower(root.get("serialNumber")), likeTerm)
            );
        };
        return equipmentRepository.findAll(spec, pageable);
    }

    //Método criado para injetar vários equipamentos de uma vez
    @Transactional
    public void saveAllItems(List<EquipmentDTO> dtos) {
        List<Equipment> entidades = dtos.stream()
                .map(dto -> {

                    Equipment entity = new Equipment();

                    entity.setName(dto.name());
                    entity.setSerialNumber(dto.serialNumber());
                    entity.setCompany(getCurrentCompany());
                    entity.setCategory(dto.category());
                    entity.setStatus(dto.status());
                    return entity;
                })
                .collect(Collectors.toList());

        equipmentRepository.saveAll(entidades);
    }

    public void deleteEquipment(Long equipmentId) {
        Equipment e = equipmentRepository.findByIdAndCompanyId(equipmentId, getCurrentCompany().getId())
                .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));
        equipmentRepository.delete(e);
    }
}
