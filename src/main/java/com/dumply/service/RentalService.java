package com.dumply.service;

import com.dumply.common.dto.EquipmentStatus;
import com.dumply.common.dto.RentalRequest;
import com.dumply.common.dto.RentalStatus;
import com.dumply.common.exception.BusinessException;
import com.dumply.model.Customer;
import com.dumply.model.Equipment;
import com.dumply.model.Rental;
import com.dumply.model.User;
import com.dumply.repository.CustomerRepository;
import com.dumply.repository.EquipmentRepository;
import com.dumply.repository.RentalRepository;
import com.dumply.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RentalService extends TenantAwareService{

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;
    @Autowired
    private UserRepository userRepository;


    @Transactional
    public List<Rental> createRental(RentalRequest request) {
        Customer customer = customerRepository.findByIdAndCompanyId(request.customerId(), getCurrentCompany().getId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado"));

        List<Rental> rentals = new ArrayList<>();

        for (var item : request.items()) {
            Rental rental = new Rental();
            rental.setCustomer(customer);
            rental.setStartDate(request.startDate());
            rental.setEndDate(request.endDate());
            if (request.endDate() != null && request.endDate().isBefore(request.startDate())) {
                throw new BusinessException("A data final não pode ser anterior à data de início");
            }
            rental.setFullAddress(request.fullAddress());
            rental.setLatitude(request.latitude());
            rental.setLongitude(request.longitude());
            rental.setCharge(item.charge());
            if (item.charge().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("O valor do aluguel não pode ser zero ou negativo");
            }
            rental.setCompany(getCurrentCompany());

            if (item.equipmentId() != null) {

                Equipment equipment = equipmentRepository.findByIdAndCompanyId(item.equipmentId(), getCurrentCompany().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Equipamento não encontrado"));

                boolean hasActiveRental =
                        rentalRepository.existsActiveRentalForCompany(
                                equipment,
                                RentalStatus.ACTIVE,
                                getCurrentCompany().getId()
                        );

                if (hasActiveRental) {
                    throw new BusinessException("Equipamento já possui aluguel ativo");
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
                .orElseThrow(() -> new EntityNotFoundException("Aluguel com esse ID não encontrado"));
    }

    @Transactional
    public Rental returnRental(Long rentalId) {
        Rental rental = rentalRepository.findByIdAndCompanyId(rentalId, getCurrentCompany().getId())
                .orElseThrow(() -> new EntityNotFoundException("Aluguel não encontrado"));

        if (rental.getStatus() == RentalStatus.FINISHED) {
            throw new BusinessException("Aluguel já finalizado");
        }

        if (rental.getStatus() == RentalStatus.SCHEDULED) {
            throw new BusinessException("Apenas aluguéis ativos podem ser finalizados");
        }

        rental.setStatus(RentalStatus.FINISHED);
        //Vou deixar assim, caso seja preferível deixar aberto só trocar.
        rental.setEndDate(java.time.LocalDateTime.now());

        Equipment equipment = rental.getEquipment();
        if (equipment != null) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);
        }

        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental updateRental(Long id, RentalRequest dto) {
        Rental rental = rentalRepository.findByIdAndCompanyId(id, getCurrentCompany().getId())
                .orElseThrow(() -> new EntityNotFoundException("Aluguel não encontrado com id: " + id));

        if (rental.getStatus() == RentalStatus.FINISHED) {
            throw new BusinessException("Não é possível editar um aluguel finalizado");
        }

        rental.setStartDate(dto.startDate());
        rental.setEndDate(dto.endDate());
        rental.setFullAddress(dto.fullAddress());
        rental.setLatitude(dto.latitude());
        rental.setLongitude(dto.longitude());

        if (dto.customerId() != null) {
            Customer customer = customerRepository.findByIdAndCompanyId(dto.customerId(), getCurrentCompany().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado"));
            rental.setCustomer(customer);
        }

        if (dto.driverId() != null) {
            User driver = userRepository.findByIdAndCompanyId(dto.driverId(), getCurrentCompany().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado"));
            rental.setDriver(driver);
        }

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
                if (itemDto.equipmentId() != null) {
                    Equipment newEquip = equipmentRepository.findByIdAndCompanyId(itemDto.equipmentId(), getCurrentCompany().getId())
                            .orElseThrow(() -> new EntityNotFoundException("Equipamento não encontrado"));

                    if (newEquip.getStatus() != EquipmentStatus.AVAILABLE) {
                        throw new BusinessException("Equipamento indisponível");
                    }

                    newEquip.setStatus(EquipmentStatus.RENTED);
                    rental.setEquipment(newEquip);
                    equipmentRepository.save(newEquip);

                    // Se antes era SCHEDULED e agora tem equipamento, e o usuário NÃO marcou como agendamento
                    // (O front-end envia equipmentId como null se for agendamento)
                    // Se chegamos aqui, equipmentId NÃO é null.
                    // Se o status era SCHEDULED, podemos mudar para ACTIVE? 
                    // Melhor manter SCHEDULED se for uma edição de agendamento, 
                    // a menos que queiramos que a adição de equipamento ATIVE o aluguel.
                    // O método activateRental existe para ativação formal.
                } else {
                    rental.setEquipment(null);
                    rental.setStatus(RentalStatus.SCHEDULED);
                }
            }
            rental.setCharge(itemDto.charge());
        }

        // Se o aluguel tem equipamento mas o status ainda é SCHEDULED (ex: acabou de ser criado via update ou era um agendamento antigo)
        // e ele NÃO foi marcado explicitamente como agendamento no request? 
        // Na verdade o RentalRequest não tem o campo isScheduled, o front usa isso para mandar equipmentId null.
        
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

    public Page<Rental> getRentalsByDriver(UUID driverId, Pageable pageable) {
        enableTenantFilterOnCurrentSession();
        UUID companyId = getCurrentCompany().getId();
        return rentalRepository.findByDriverIdAndCompanyId(driverId, companyId, pageable);
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
                .orElseThrow(() -> new EntityNotFoundException("Aluguel não encontrado"));

        if (rental.getStatus() == RentalStatus.ACTIVE) {
            return rental; // Já está ativo
        }

        if (rental.getStatus() != RentalStatus.SCHEDULED) {
            throw new BusinessException("Apenas aluguéis agendados podem ser ativados");
        }

        if (rental.getEquipment() == null) {
            throw new BusinessException("Atribua um equipamento antes de ativar o aluguel");
        }

        rental.setStatus(RentalStatus.ACTIVE);
        return rentalRepository.save(rental);
    }

    public void deleteRental(Long rentalId) {
        Rental r = rentalRepository.findByIdAndCompanyId(rentalId, getCurrentCompany().getId())
                .orElseThrow(() -> new EntityNotFoundException("Aluguel não encontrado"));
        rentalRepository.delete(r);
    }
}