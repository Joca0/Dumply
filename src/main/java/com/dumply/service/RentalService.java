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

import java.util.List;

@Service
public class RentalService {

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Transactional
    public Rental createRental(RentalRequest request) {
        Equipment equipment = equipmentRepository.findById(request.equipmentId())
                .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));

        if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
            throw new RuntimeException("Equipamento indisponível para locação");
        }

        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));


        Rental rental = new Rental();
        rental.setEquipment(equipment);
        rental.setCustomer(customer);

        // VALIDAR SE A DATA NÃO É INVÁLIDA

        if (request.endDate().isBefore(request.startDate())) {
            throw new RuntimeException("Data final deve ser maior que a data inicial");
        } else {
            rental.setStartDate(request.startDate());
            rental.setEndDate(request.endDate());
        }

        //CONTINUA OPERAÇÃO

        rental.setFullAddress(request.fullAddress());
        rental.setLatitude(request.latitude());
        rental.setLongitude(request.longitude());

        rental.setCharge(request.charge());

        rental.setStatus(RentalStatus.ACTIVE);

        // Atualiza status do ativo
        equipment.setStatus(EquipmentStatus.RENTED);
        equipmentRepository.save(equipment);

        Rental savedRental = rentalRepository.save(rental);
        invoiceService.createInvoiceForRental(savedRental);

        return savedRental;
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
        rental.setEndDate(java.time.LocalDate.now());

        Equipment equipment = rental.getEquipment();
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(equipment);

        return rentalRepository.save(rental);
    }

    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
    }

    public void deleteRental(Long rentalId) {
        rentalRepository.deleteById(rentalId);
    }
}