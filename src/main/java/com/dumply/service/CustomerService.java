package com.dumply.service;

import com.dumply.common.exception.BusinessException;
import com.dumply.model.Customer;
import com.dumply.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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
    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public void delete(Long id) {
        customerRepository.deleteById(id);
    }


}
