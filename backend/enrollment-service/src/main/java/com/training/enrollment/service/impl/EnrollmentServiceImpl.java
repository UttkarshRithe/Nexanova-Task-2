package com.training.enrollment.service.impl;

import com.training.enrollment.dto.request.EnrollmentRequestDTO;
import com.training.enrollment.dto.response.EnrollmentResponseDTO;
import com.training.enrollment.entity.Enrollment;
import com.training.enrollment.exception.BadRequestException;
import com.training.enrollment.repository.EnrollmentRepository;
import com.training.enrollment.service.EnrollmentService;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public EnrollmentResponseDTO enrollStudent(EnrollmentRequestDTO request) {
        boolean exists = enrollmentRepository
                .existsByStudentIdAndCourseId(request.getStudentId(), request.getCourseId());

        if (exists) {
            throw new BadRequestException(
                    "Student already enrolled in this course."
            );
        }

        Enrollment enrollment = Enrollment.builder()
                .studentId(request.getStudentId())
                .courseId(request.getCourseId())
                .scheduleId(request.getScheduleId())  // ← ADD
                .build();

        return toResponse(enrollmentRepository.save(enrollment));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER','TRAINEE')")
    public List<EnrollmentResponseDTO> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public List<EnrollmentResponseDTO> bulkEnrollStudents(List<EnrollmentRequestDTO> requests) {
        List<EnrollmentResponseDTO> savedEnrollments = new ArrayList<>();
        Set<String> processedPairs = new HashSet<>();

        for (EnrollmentRequestDTO request : requests) {
            String key = request.getStudentId() + ":" + request.getCourseId();

            // Skip duplicates within the same bulk request.
            if (!processedPairs.add(key)) {
                continue;
            }

            // Skip duplicates already stored in the database.
            boolean exists = enrollmentRepository.existsByStudentIdAndCourseId(request.getStudentId(), request.getCourseId());
            if (exists) {
                continue;
            }

            Enrollment enrollment = Enrollment.builder()
                    .studentId(request.getStudentId())
                    .courseId(request.getCourseId())
                    .build();

            savedEnrollments.add(toResponse(enrollmentRepository.save(enrollment)));
        }

        return savedEnrollments;
    }

    private EnrollmentResponseDTO toResponse(Enrollment enrollment) {
        return EnrollmentResponseDTO.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudentId())
                .courseId(enrollment.getCourseId())
                .enrolledAt(enrollment.getEnrolledAt())
                .scheduleId(enrollment.getScheduleId())  // ← ADD
                .build();
    }

}
