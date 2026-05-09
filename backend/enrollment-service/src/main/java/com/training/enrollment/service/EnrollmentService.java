package com.training.enrollment.service;

import com.training.enrollment.dto.request.EnrollmentRequestDTO;
import com.training.enrollment.dto.response.EnrollmentResponseDTO;
import java.util.List;

public interface EnrollmentService {

    EnrollmentResponseDTO enrollStudent(EnrollmentRequestDTO request);

    List<EnrollmentResponseDTO> getEnrollmentsByStudent(Long studentId);

    List<EnrollmentResponseDTO> bulkEnrollStudents(List<EnrollmentRequestDTO> requests);
}
