package com.training.enrollment.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentResponseDTO {

    private Long id;
    private Long studentId;
    private Long courseId;
    private LocalDateTime enrolledAt;
    private Long scheduleId;  // ← ADD
}
