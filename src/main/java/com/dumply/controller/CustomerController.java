package com.dumply.controller;

import com.dumply.common.dto.CustomerAutocomplete;
import com.dumply.model.Customer;
import com.dumply.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping
    public Customer createCustomer(@RequestBody Customer customer) {
        return customerService.createCustomer(customer);
    }

    @GetMapping("/{id}")
    public Customer findById(@PathVariable Long id) {
        return customerService.findById(id);
    }

    @GetMapping
    public Page<Customer> getAllCustomers(@RequestParam(required = false) String search, @PageableDefault(size = 10) Pageable pageable) {
        return customerService.findAll(search, pageable);
    }

    @GetMapping("/autocomplete")
    public List<CustomerAutocomplete> customerAutocomplete(@RequestParam(value = "q", required = false) String q) {
        return customerService.searchForSelect(q);
    }

    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable Long id, @RequestBody Customer updatedCustomer) {
        return customerService.updateCustomer(id, updatedCustomer);
    }

    @DeleteMapping("/{id}")
    public void deleteCustomer(@PathVariable Long id) {
        customerService.delete(id);
    }
}
