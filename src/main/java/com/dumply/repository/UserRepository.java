package com.dumply.repository;

import com.dumply.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    
    @org.springframework.data.jpa.repository.Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM users WHERE email = :email", nativeQuery = true)
    boolean existsByEmailGlobal(@org.springframework.data.repository.query.Param("email") String email);

    /** Busca por email e company para garantir isolamento multi-tenant no login/token. */
    Optional<User> findByEmailAndCompanyId(String email, UUID companyId);
}
