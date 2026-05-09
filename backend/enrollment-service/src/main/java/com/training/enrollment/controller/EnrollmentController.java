package com.training.enrollment.controller;

import com.training.enrollment.dto.request.EnrollmentRequestDTO;
import com.training.enrollment.dto.response.EnrollmentResponseDTO;
import com.training.enrollment.exception.BadRequestException;
import com.training.enrollment.exception.ResourceNotFoundException;
import com.training.enrollment.service.EnrollmentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentResponseDTO>> getEnrollmentsByStudent(
            @PathVariable("studentId") Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    @PostMapping
    public ResponseEntity<?> enrollStudent(
            @Valid @RequestBody EnrollmentRequestDTO request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(enrollmentService.enrollStudent(request));
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ex.getMessage()));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        }
    }
}

