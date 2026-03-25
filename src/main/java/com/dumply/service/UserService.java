package com.dumply.service;

import com.dumply.common.dto.DriverAutocomplete;
import com.dumply.common.dto.Role;
import com.dumply.common.dto.UserRegister;
import com.dumply.common.dto.UserResponse;
import com.dumply.common.exception.BusinessException;
import com.dumply.model.Company;
import com.dumply.model.User;
import com.dumply.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService extends TenantAwareService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(UserRegister body, Role role) {
        if (userRepository.existsByEmailGlobal(body.email())) {
            throw new BusinessException("E-mail já está em uso.");
        }
        Company company = getCurrentCompany();

        // Cria o usuário respeitando o multi-tenancy e definindo a role de forma programática,
        // ignorando qualquer informação extra que possa vir do payload (DTO).
        User user = new User();
        user.setEmail(body.email());
        user.setPassword(passwordEncoder.encode(body.password()));
        user.setDocument(body.document());
        user.setFullName(body.fullName());
        user.setRole(role);
        user.setFirstLogin(true);
        user.setCompany(company);

        userRepository.save(user);
        return mapToResponse(user);
    }

    public List<UserResponse> listByRoles(List<Role> roles) {
        Company company = getCurrentCompany();
        return userRepository.findByCompanyIdAndRoleIn(company.getId(), roles)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse findById(UUID id) {
        Company company = getCurrentCompany();
        User user = userRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UserRegister body) {
        Company company = getCurrentCompany();
        User user = userRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        // Verificação de segurança: E-mail deve ser único globalmente se alterado
        if (!user.getEmail().equalsIgnoreCase(body.email()) && userRepository.existsByEmailGlobal(body.email())) {
            throw new BusinessException("E-mail já está em uso.");
        }

        // Os campos são atualizados individualmente. A role do usuário NÃO é alterada 
        // porque ela não é recebida no UserRegister (DTO), garantindo integridade.
        user.setEmail(body.email());
        if (body.password() != null && !body.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(body.password()));
        }
        user.setDocument(body.document());
        user.setFullName(body.fullName());

        userRepository.save(user);
        return mapToResponse(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        Company company = getCurrentCompany();
        User user = userRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        
        userRepository.delete(user);
    }

    public List<DriverAutocomplete> searchForSelect(String search) {
        if (search == null || search.isBlank()) {
            return List.of();
        }
        return userRepository.searchDriversForSelect(
                search.toLowerCase(),
                getCurrentCompany().getId()
        );
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getDocument(),
                user.getRole()
        );
    }
}
