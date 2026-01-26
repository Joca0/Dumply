package com.dumply.controller;

import com.dumply.common.dto.RentalRequest;
import com.dumply.model.Rental;
import com.dumply.service.RentalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rentals")
public class RentalController {


    @Autowired
    private RentalService rentalService;

    @PostMapping
    public List<Rental> createRental(@RequestBody RentalRequest rentalRequest) {
        return rentalService.createRental(rentalRequest);
    }

    @PutMapping("/{id}")
    public Rental updateRental(@PathVariable Long id, @RequestBody RentalRequest rentalRequest) {
        return rentalService.updateRental(id, rentalRequest);
    }

    @GetMapping
    public List<Rental> getAllRentals() {
        return rentalService.getAllRentals();
    }

    @GetMapping("/active")
    public List<Rental> getRentalsForMap() {
        return rentalService.getActiveRentalsForMap();
    }

    @GetMapping("/{id}")
    public Rental getRental(@PathVariable Long id) {
        return rentalService.getRentalById(id);
    }

    @PostMapping("/{rentalId}/return")
    public Rental returnRental(@PathVariable Long rentalId) {
        return rentalService.returnRental(rentalId);
    }

    @DeleteMapping("/{rentalId}")
    public void deleteRental(@PathVariable Long rentalId) {
        rentalService.deleteRental(rentalId);
    }


}
