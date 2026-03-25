package com.dumply.config;

import com.dumply.common.dto.*;
import com.dumply.model.*;
import com.dumply.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevDataLoader implements CommandLineRunner {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Override
    public void run(String... args) {

        if (userRepository.findByEmail("admin@dumply.dev").isPresent()) {
            return;
        }

        Company company = new Company();
        company.setName("Dumply DEV");
        company.setStatus(CompanyStatus.CONFIRMED);
        company.setTrialEndsAt(null);

        companyRepository.save(company);

        User admin = new User();
        admin.setFullName("Dumply Admin");
        admin.setEmail("admin@dumply.dev");
        admin.setFirstLogin(true);
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setCompany(company);

        User driver = new User();
        driver.setFullName("Dumply Driver");
        driver.setEmail("driver@dumply.dev");
        driver.setDocument("503.600.990-00");
        driver.setFirstLogin(true);
        driver.setPassword(passwordEncoder.encode("driver123"));
        driver.setRole(Role.DRIVER);
        driver.setCompany(company);

        Equipment equipment = new Equipment();
        equipment.setName("Caçamba");
        equipment.setSerialNumber("01");
        equipment.setCategory("Caçamba");
        equipment.setCompany(company);

        Customer customer = new Customer();
        customer.setFullName("Seu zé");
        customer.setCompanyName("Empresa XYZ");
        customer.setDocument("123.456.789-00");
        customer.setPhone("(11) 12345-6789");
        customer.setEmail("seuze@webmail.com");
        customer.setCompany(company);

        Rental rental = new Rental();
        rental.setCustomer(customer);
        rental.setEquipment(equipment);
        rental.setStartDate(java.time.LocalDateTime.now());
        rental.setEndDate(java.time.LocalDateTime.now().plusDays(3));
        rental.setFullAddress("Rua dos bobos, 123");
        rental.setLatitude(0.0);
        rental.setLongitude(0.0);
        rental.setCharge(java.math.BigDecimal.valueOf(350.0));
        rental.setStatus(RentalStatus.ACTIVE);
        equipment.setStatus(EquipmentStatus.RENTED);
        rental.setCompany(company);

        Rental rental2 = new Rental();
        rental2.setCustomer(customer);
        rental2.setEquipment(equipment);
        rental2.setStartDate(java.time.LocalDateTime.now().minusDays(5));
        rental2.setEndDate(java.time.LocalDateTime.now().minusDays(2));
        rental2.setFullAddress("Av. Paulista, 1000");
        rental2.setLatitude(0.0);
        rental2.setLongitude(0.0);
        rental2.setCharge(java.math.BigDecimal.valueOf(450.0));
        rental2.setStatus(RentalStatus.FINISHED);
        rental2.setCompany(company);

        Rental rental3 = new Rental();
        rental3.setCustomer(customer);
        rental3.setEquipment(equipment);
        rental3.setStartDate(java.time.LocalDateTime.now().minusDays(10));
        rental3.setEndDate(java.time.LocalDateTime.now().minusDays(7));
        rental3.setFullAddress("Rua Augusta, 500");
        rental3.setLatitude(0.0);
        rental3.setLongitude(0.0);
        rental3.setCharge(java.math.BigDecimal.valueOf(300.0));
        rental3.setStatus(RentalStatus.FINISHED);
        rental3.setCompany(company);

        customerRepository.save(customer);
        equipmentRepository.save(equipment);
        userRepository.save(admin);
        userRepository.save(driver);
        rentalRepository.save(rental);
        rentalRepository.save(rental2);
        rentalRepository.save(rental3);

        Invoice invoice = new Invoice();
        invoice.setCustomer(customer);
        invoice.setCompany(company);
        invoice.setCreatedAt(java.time.LocalDateTime.now());
        invoice.setStatus(InvoiceStatus.PENDING);
        invoice.setTotalAmount(java.math.BigDecimal.valueOf(750.0));
        invoiceRepository.save(invoice);

        rental2.setInvoice(invoice);
        rental2.setInvoiceStatus(InvoiceStatus.PENDING);
        rental3.setInvoice(invoice);
        rental3.setInvoiceStatus(InvoiceStatus.PENDING);

        rentalRepository.save(rental2);
        rentalRepository.save(rental3);
    }
}
