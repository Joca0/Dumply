package com.dumply.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String fullName;

    @NotNull
    private String document;

    private String email;
    private String phone;

    //@OneToMany(mappedBy = "customer")
    //private List<Rental> rentals;

    public Customer() {

    }

    public Customer(String companyName, String fullName, String document, String email, String phone) {
        this.companyName = companyName;
        this.fullName = fullName;
        this.document = document;
        this.email = email;
        this.phone = phone;
    }

}
