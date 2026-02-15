package com.dumply.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.util.UUID;

@MappedSuperclass
@FilterDef(
        name = "companyFilter",
        parameters = @ParamDef(name = "companyId", type = UUID.class)
)
public abstract class CompanySuperEntity {

    @Column(name = "company_id", insertable = false, updatable = false)
    private UUID companyId;

}
