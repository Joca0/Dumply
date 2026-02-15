package com.dumply.service;

import com.dumply.common.dto.EquipmentStatus;
import com.dumply.common.dto.RentalRequest;
import com.dumply.common.dto.RentalStatus;
import com.dumply.common.exception.InvalidRentalDateException;
import com.dumply.model.Customer;
import com.dumply.model.Equipment;
import com.dumply.model.Rental;
import com.dumply.repository.CustomerRepository;
import com.dumply.repository.EquipmentRepository;
import com.dumply.repository.RentalRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class RentalService extends TenantAwareService{

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;


    @Transactional
    public List<Rental> createRental(RentalRequest request) {
        Customer customer = customerRepository.findByIdAndCompanyId(request.customerId(), getCurrentCompany().getId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        List<Rental> rentals = new ArrayList<>();

        for (var item : request.items()) {
            Rental rental = new Rental();
            rental.setCustomer(customer);
            rental.setStartDate(request.startDate());
            rental.setEndDate(request.endDate());
            rental.setFullAddress(request.fullAddress());
            rental.setLatitude(request.latitude());
            rental.setLongitude(request.longitude());
            rental.setCharge(item.charge());
            rental.setCompany(getCurrentCompany());

            if (item.equipmentId() != null) {

                Equipment equipment = equipmentRepository.findByIdAndCompanyId(item.equipmentId(), getCurrentCompany().getId())
                        .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));

                boolean hasActiveRental =
                        rentalRepository.existsActiveRentalForCompany(
                                equipment,
                                RentalStatus.ACTIVE,
                                getCurrentCompany().getId()
                        );

                if (hasActiveRental) {
                    throw new RuntimeException("Equipamento já possui aluguel ativo");
                }

                rental.setEquipment(equipment);
                rental.setStatus(RentalStatus.ACTIVE);

                equipment.setStatus(EquipmentStatus.RENTED);
                equipmentRepository.save(equipment);
            } else {
                // AGENDAMENTO
                rental.setEquipment(null);
                rental.setStatus(RentalStatus.SCHEDULED);
            }

            rentals.add(rentalRepository.save(rental));
        }
        return rentals;
    }

    public List<Rental> getActiveRentalsForMap() {
        enableTenantFilterOnCurrentSession();
        return rentalRepository.findByStatus(
                RentalStatus.ACTIVE,
                getCurrentCompany().getId()
        );
    }

    public Rental getRentalById(Long id) {
        return rentalRepository.findByIdAndCompanyId(id, getCurrentCompany().getId())
                .orElseThrow(() -> new RuntimeException("Aluguel com esse ID não encontrado"));
    }

    @Transactional
    public Rental returnRental(Long rentalId) {
        Rental rental = rentalRepository.findByIdAndCompanyId(rentalId, getCurrentCompany().getId())
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
        Rental rental = rentalRepository.findByIdAndCompanyId(id, getCurrentCompany().getId())
                .orElseThrow(() -> new RuntimeException("Aluguel não encontrado com id: " + id));

        rental.setStartDate(dto.startDate());
        rental.setEndDate(dto.endDate());
        rental.setFullAddress(dto.fullAddress());
        rental.setLatitude(dto.latitude());
        rental.setLongitude(dto.longitude());

        // Como o form envia uma lista, pegamos o primeiro item para este Rental específico
        if (dto.items() != null && !dto.items().isEmpty()) {
            var itemDto = dto.items().get(0); // Pega o equipamento selecionado no form

            // Se o equipamento mudou, gerenciar os status
            if (rental.getEquipment() == null || !rental.getEquipment().getId().equals(itemDto.equipmentId())) {

                // Só libera o antigo se ele existir
                if (rental.getEquipment() != null) {
                    Equipment oldEquip = rental.getEquipment();
                    oldEquip.setStatus(EquipmentStatus.AVAILABLE);
                    equipmentRepository.save(oldEquip);
                }

                // Busca e reserva o novo
                Equipment newEquip = equipmentRepository.findByIdAndCompanyId(itemDto.equipmentId(), getCurrentCompany().getId())
                        .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));

                if (newEquip.getStatus() != EquipmentStatus.AVAILABLE) {
                    throw new RuntimeException("Equipamento indisponível");
                }

                newEquip.setStatus(EquipmentStatus.RENTED);
                rental.setEquipment(newEquip);
                equipmentRepository.save(newEquip);
            }
            rental.setCharge(itemDto.charge());
        }

        return rentalRepository.save(rental);
    }

    public Page<Rental> getAllRentals(String search, String month, Long customerId, RentalStatus status, Pageable pageable) {
        enableTenantFilterOnCurrentSession();
        Specification<Rental> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("customer").get("fullName")), "%" + search.toLowerCase() + "%"));
            }
            if (month != null && !month.isBlank()) {
                // Filtro por mês
                LocalDateTime start = LocalDate.parse(month + "-01").atStartOfDay();
                LocalDateTime end = start.plusMonths(1);
                predicates.add(cb.between(root.get("startDate"), start, end));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                predicates.add(root.get("status").in(
                        RentalStatus.ACTIVE,
                        RentalStatus.FINISHED
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return rentalRepository.findAll(spec, pageable);
    }

    public Page<Rental> getAllScheduledRentals(String search, String month, Pageable pageable) {
        enableTenantFilterOnCurrentSession();
        Specification<Rental> spec = ((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("customer").get("fullName")), "%" + search.toLowerCase() + "%"));
            }
            if (month != null && !month.isBlank()) {
                // Filtro por mês
                LocalDateTime start = LocalDate.parse(month + "-01").atStartOfDay();
                LocalDateTime end = start.plusMonths(1);
                predicates.add(cb.between(root.get("startDate"), start, end));
            }
            predicates.add(cb.equal(root.get("status"), RentalStatus.SCHEDULED));
            return cb.and(predicates.toArray(new Predicate[0]));
        });
        return rentalRepository.findAll(spec, pageable);
    }

    @Transactional
    public Rental activateRental(Long rentalId) {
        Rental rental = rentalRepository.findByIdAndCompanyId(rentalId, getCurrentCompany().getId())
                .orElseThrow(() -> new RuntimeException("Aluguel não encontrado"));

        if (rental.getStatus() != RentalStatus.SCHEDULED) {
            throw new RuntimeException("Apenas aluguéis agendados podem ser ativados");
        }

        if (rental.getEquipment() == null) {
            throw new RuntimeException("Atribua um equipamento antes de ativar o aluguel");
        }

        rental.setStatus(RentalStatus.ACTIVE);
        return rentalRepository.save(rental);
    }

    public void deleteRental(Long rentalId) {
        Rental r = rentalRepository.findByIdAndCompanyId(rentalId, getCurrentCompany().getId())
                .orElseThrow(() -> new RuntimeException("Aluguel não encontrado"));
        rentalRepository.delete(r);
    }
}