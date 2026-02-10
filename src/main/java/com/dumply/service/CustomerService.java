package com.dumply.service;

import com.dumply.common.dto.CustomerAutocomplete;
import com.dumply.common.exception.BusinessException;
import com.dumply.model.Customer;
import com.dumply.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public Customer createCustomer(Customer customer) {
        try {
            return customerRepository.save(customer);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException("Cliente já cadastrado");
        }
    }
    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ID não encontrado"));
    }

    public Customer updateCustomer(Long id, Customer updatedCustomer) {
        try {
            return customerRepository.findById(id)
                    .map(customer -> {
                        customer.setCompanyName(updatedCustomer.getCompanyName());
                        customer.setFullName(updatedCustomer.getFullName());
                        customer.setDocument(updatedCustomer.getDocument());
                        customer.setEmail(updatedCustomer.getEmail());
                        customer.setPhone(updatedCustomer.getPhone());
                        return customerRepository.save(customer);
                    })
                    .orElseThrow(() -> new RuntimeException("Erro ao atualizar cliente: " + id));
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException("Já existe um cliente com esse documento");
        }

    }

    public List<CustomerAutocomplete> searchForSelect(String search) {
        if (search == null || search.isBlank()) {
            return List.of();
        }
        return customerRepository.searchForSelect(search.toLowerCase());
    }

    public Page<Customer> findAll(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return customerRepository.findAll(pageable);
        }

        Specification<Customer> spec = (root, query, cb) -> {
            String likeTerm = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("fullName")), likeTerm),
                    cb.like(root.get("document"), likeTerm)
                    );
        };
        return customerRepository.findAll(spec, pageable);
    }

    public void delete(Long id) {
        customerRepository.deleteById(id);
    }


}
