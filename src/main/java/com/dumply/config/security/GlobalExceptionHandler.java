package com.dumply.config.security;

import com.dumply.common.exception.BusinessException;
import com.dumply.common.exception.InvalidRentalDateException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<String> handleBusiness(BusinessException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(ex.getMessage());
    }

    @ExceptionHandler(InvalidRentalDateException.class)
    public ResponseEntity<String> handleInvalidRentalDate(InvalidRentalDateException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT) //409
                .body(ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT) //409
                .body("Já existe um registro com esses dados");
    }
}
