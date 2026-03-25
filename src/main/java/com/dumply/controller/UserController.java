package com.dumply.controller;

import com.dumply.common.dto.DriverAutocomplete;
import com.dumply.common.dto.Role;
import com.dumply.common.dto.UserRegister;
import com.dumply.common.dto.UserResponse;
import com.dumply.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@PreAuthorize("hasAnyRole('ADMIN','OWNER')")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/driver")
    public ResponseEntity<UserResponse> createDriver(@RequestBody UserRegister body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(body, Role.DRIVER));
    }

    @PostMapping("/manager")
    public ResponseEntity<UserResponse> createManager(@RequestBody UserRegister body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(body, Role.MANAGER));
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<UserResponse>> listDrivers() {
        return ResponseEntity.ok(userService.listByRoles(List.of(Role.DRIVER)));
    }

    @GetMapping("/managers")
    public ResponseEntity<List<UserResponse>> listManagers() {
        return ResponseEntity.ok(userService.listByRoles(List.of(Role.MANAGER)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/drivers/autocomplete")
    public ResponseEntity<List<DriverAutocomplete>> autocomplete(@RequestParam(value = "q", required = false) String q) {
        return ResponseEntity.ok(userService.searchForSelect(q));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id, @RequestBody UserRegister body) {
        return ResponseEntity.ok(userService.updateUser(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
