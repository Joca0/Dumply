package com.dumply.controller;

import com.dumply.common.dto.EquipmentAutocomplete;
import com.dumply.common.dto.EquipmentDTO;
import com.dumply.model.Equipment;
import com.dumply.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipments")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    @PostMapping
    public Equipment createEquipment(@RequestBody Equipment equipment) {
        return equipmentService.createEquipment(equipment);
    }

    @PostMapping("/bulk")
    public void createEquipments(@RequestBody List<EquipmentDTO> equipments) {
        equipmentService.saveAllItems(equipments);

    }

    @GetMapping("/{id}")
    public Equipment findById(@PathVariable Long id) {
        return equipmentService.findById(id);
    }

    @GetMapping("/autocomplete")
    public List<EquipmentAutocomplete> equipmentAutocomplete(@RequestParam(value = "q", required = false) String q) {
        return equipmentService.searchForSelect(q);
    }

    @GetMapping
    public Page<Equipment> getAllEquipments(@RequestParam(required = false) String search,@PageableDefault(size = 10) Pageable pageable) {
        return equipmentService.getAllEquipments(search, pageable);
    }

    @PutMapping("/{id}")
    public Equipment updateEquipment(@PathVariable Long id, @RequestBody Equipment updatedEquipment) {
        return equipmentService.updateEquipment(id, updatedEquipment);
    }

    @DeleteMapping("/{id}")
    public void deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
    }
}
