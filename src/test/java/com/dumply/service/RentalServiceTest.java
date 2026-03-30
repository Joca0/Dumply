package com.dumply.service;

import com.dumply.common.dto.*;
import com.dumply.config.tenant.TenantContext;
import com.dumply.model.Company;
import com.dumply.model.Equipment;
import com.dumply.model.Rental;
import com.dumply.model.Customer;
import com.dumply.repository.CompanyRepository;
import com.dumply.repository.EquipmentRepository;
import com.dumply.repository.RentalRepository;
import com.dumply.repository.CustomerRepository;
import com.dumply.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private jakarta.persistence.EntityManagerFactory entityManagerFactory;

    @InjectMocks
    private RentalService rentalService;

    private UUID companyId;
    private Company company;

    @BeforeEach
    void setUp() {
        companyId = UUID.randomUUID();
        TenantContext.setCompanyId(companyId);
        company = new Company();
        company.setId(companyId);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void activateRental_ShouldUpdateEquipmentStatus() {
        // Mock getCurrentCompany (from TenantAwareService)
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        Long rentalId = 1L;
        Rental rental = new Rental();
        rental.setId(rentalId);
        rental.setStatus(RentalStatus.SCHEDULED);
        
        Equipment equipment = new Equipment();
        equipment.setId(10L);
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        rental.setEquipment(equipment);

        when(rentalRepository.findByIdAndCompanyId(rentalId, companyId)).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Rental result = rentalService.activateRental(rentalId);

        assertEquals(RentalStatus.ACTIVE, result.getStatus());
        // This is expected to FAIL before fix
        assertEquals(EquipmentStatus.RENTED, equipment.getStatus(), "O status do equipamento deve ser RENTED após ativação");
        verify(equipmentRepository).save(equipment);
    }

    @Test
    void updateRental_WhenScheduledRentalAddsEquipment_ShouldChangeToActive() {
        // Mock getCurrentCompany
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        Long rentalId = 1L;
        Rental rental = new Rental();
        rental.setId(rentalId);
        rental.setStatus(RentalStatus.SCHEDULED);
        rental.setEquipment(null);

        RentalRequest request = new RentalRequest(
                List.of(new RentalItemRequest(10L, new BigDecimal("100.00"))),
                1L, null, null, null, "Rua Teste", 0.0, 0.0
        );

        Equipment equipment = new Equipment();
        equipment.setId(10L);
        equipment.setStatus(EquipmentStatus.AVAILABLE);

        Customer customer = new Customer();
        customer.setId(1L);

        when(customerRepository.findByIdAndCompanyId(1L, companyId)).thenReturn(Optional.of(customer));
        when(rentalRepository.findByIdAndCompanyId(rentalId, companyId)).thenReturn(Optional.of(rental));
        when(equipmentRepository.findByIdAndCompanyId(10L, companyId)).thenReturn(Optional.of(equipment));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Rental result = rentalService.updateRental(rentalId, request);

        assertEquals(RentalStatus.ACTIVE, result.getStatus(), "O status do aluguel deve mudar para ACTIVE ao incluir equipamento");
        assertEquals(EquipmentStatus.RENTED, equipment.getStatus());
        verify(equipmentRepository).save(equipment);
    }

    @Test
    void deleteRental_ShouldReleaseEquipment() {
        // Mock getCurrentCompany
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        Long rentalId = 1L;
        Rental rental = new Rental();
        rental.setId(rentalId);
        
        Equipment equipment = new Equipment();
        equipment.setId(10L);
        equipment.setStatus(EquipmentStatus.RENTED);
        rental.setEquipment(equipment);

        when(rentalRepository.findByIdAndCompanyId(rentalId, companyId)).thenReturn(Optional.of(rental));

        rentalService.deleteRental(rentalId);

        assertEquals(EquipmentStatus.AVAILABLE, equipment.getStatus(), "O status do equipamento deve voltar para AVAILABLE ao deletar o aluguel");
        verify(equipmentRepository).save(equipment);
        verify(rentalRepository).delete(rental);
    }
}
