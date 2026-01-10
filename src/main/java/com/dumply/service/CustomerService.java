package com.dumply.service;

import com.dumply.model.Customer;
import com.dumply.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ID não encontrado"));
    }

    public Customer updateCustomer(Long id, Customer updatedCustomer) {
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
    }
    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public void delete(Long id) {
        customerRepository.deleteById(id);
    }


}
