package com.dumply.repository;

import com.dumply.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    /** Busca por email e company para garantir isolamento multi-tenant no login/token. */
    Optional<User> findByEmailAndCompanyId(String email, UUID companyId);
}
