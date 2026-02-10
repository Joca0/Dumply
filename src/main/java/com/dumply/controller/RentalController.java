package com.dumply.controller;

import com.dumply.common.dto.RentalRequest;
import com.dumply.common.dto.RentalStatus;
import com.dumply.model.Rental;
import com.dumply.service.RentalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
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
    public Page<Rental> getAllRentals(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) RentalStatus status,
            @PageableDefault(size = 10)
            @SortDefault.SortDefaults({
                    @SortDefault(sort = "status", direction = Sort.Direction.ASC),
                    @SortDefault(sort = "startDate", direction = Sort.Direction.DESC)
            }) Pageable pageable) {
        return rentalService.getAllRentals(search, month, customerId, status, pageable);
    }

    @GetMapping("/scheduled")
    public Page<Rental> getAllScheduledRentals(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String month,
            @PageableDefault(size = 10)
            @SortDefault(sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable ) {
        return rentalService.getAllScheduledRentals(search, month, pageable);
    }

    @PostMapping("/{rentalId}/activate")
    public Rental activateRental(@PathVariable Long rentalId) {
        return rentalService.activateRental(rentalId);
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
