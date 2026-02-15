package com.dumply.model;

import com.jereztech.validation.br.constraints.CPFCNPJ;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.util.UUID;

@Entity
@Getter
@Setter
@Filter(
        name = "companyFilter",
        condition = "company_id = :companyId"
)
@Table(
        name = "customers",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"company_id", "document"})
        }
)
public class Customer extends CompanySuperEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String fullName;

    @NotNull
    private String document;

    private String email;
    private String phone;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Company company;


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
