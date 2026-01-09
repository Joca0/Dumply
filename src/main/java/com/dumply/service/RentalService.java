package com.dumply.service;

import com.dumply.common.EquipmentStatus;
import com.dumply.common.RentalRequest;
import com.dumply.common.RentalStatus;
import com.dumply.model.Customer;
import com.dumply.model.Equipment;
import com.dumply.model.Rental;
import com.dumply.repository.CustomerRepository;
import com.dumply.repository.EquipmentRepository;
import com.dumply.repository.RentalRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RentalService {

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;
    

    @Transactional
    public List<Rental> createRental(RentalRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        if (request.endDate().isBefore(request.startDate())) {
            throw new RuntimeException("Data final deve ser maior que a data inicial");
        }

        List<Rental> rentals = new ArrayList<>();

        for (var item : request.items()) {
            Equipment equipment = equipmentRepository.findById(item.equipmentId())
                    .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));

            if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
                throw new RuntimeException("Equipamento " + equipment.getName() + " indisponível para locação");
            }

            Rental rental = new Rental();
            rental.setEquipment(equipment);
            rental.setCustomer(customer);
            rental.setStartDate(request.startDate());
            rental.setEndDate(request.endDate());
            rental.setFullAddress(request.fullAddress());
            rental.setLatitude(request.latitude());
            rental.setLongitude(request.longitude());
            rental.setCharge(item.charge());
            rental.setStatus(RentalStatus.ACTIVE);

            // Atualiza status do ativo
            equipment.setStatus(EquipmentStatus.RENTED);
            equipmentRepository.save(equipment);

            rentals.add(rentalRepository.save(rental));
        }

        return rentals;
    }

    public List<Rental> getActiveRentalsForMap() {
        return rentalRepository.findByStatus(RentalStatus.ACTIVE);
    }

    @Transactional
    public Rental returnRental(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Aluguel não encontrado"));

        if (rental.getStatus() == RentalStatus.FINISHED) {
            throw new RuntimeException("Aluguel já finalizado");
        }

        rental.setStatus(RentalStatus.FINISHED);
        //Vou deixar assim, caso seja preferível deixar aberto só trocar.
        rental.setEndDate(java.time.LocalDateTime.now());

        Equipment equipment = rental.getEquipment();
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(equipment);

        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental updateRental(Long id, RentalRequest dto) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aluguel não encontrado com id: " + id));


        rental.setStartDate(dto.startDate());
        rental.setEndDate(dto.endDate());
        rental.setFullAddress(dto.fullAddress());
        rental.setLatitude(dto.latitude());
        rental.setLongitude(dto.longitude());

        return rentalRepository.save(rental);
    }

    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
    }

    public void deleteRental(Long rentalId) {
        rentalRepository.deleteById(rentalId);
    }
}