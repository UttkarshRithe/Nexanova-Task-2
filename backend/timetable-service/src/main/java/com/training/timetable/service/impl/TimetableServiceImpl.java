package com.training.timetable.service.impl;

import com.training.timetable.dto.response.TimetableResponseDTO;
import com.training.timetable.exception.BadRequestException;
import com.training.timetable.service.TimetableService;
import com.training.timetable.service.client.EnrollmentClient;
import com.training.timetable.service.client.SchedulingClient;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TimetableServiceImpl implements TimetableService {

    private final EnrollmentClient enrollmentClient;
    private final SchedulingClient schedulingClient;

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('TRAINEE')")
    public List<TimetableResponseDTO> getStudentTimetable(Long studentId) {
        if (studentId == null || studentId <= 0) {
            throw new BadRequestException("studentId must be a positive number.");
        }

        List<EnrollmentClient.EnrollmentView> enrollments = enrollmentClient.getEnrollmentsByStudent(studentId);
        List<TimetableResponseDTO> timetableEntries = new ArrayList<>();

        for (EnrollmentClient.EnrollmentView enrollment : enrollments) {
            // Assumption: courseId maps to scheduleId in this initial service-only implementation.
            List<SchedulingClient.TimeSlotView> slots =
                    schedulingClient.getSlotsBySchedule(enrollment.getCourseId());

            for (SchedulingClient.TimeSlotView slot : slots) {
                timetableEntries.add(TimetableResponseDTO.builder()
                        .dayOfWeek(slot.getDayOfWeek())
                        .startTime(slot.getStartTime())
                        .endTime(slot.getEndTime())
                        .moduleName("Module-" + slot.getModuleId())
                        .trainerName("Trainer-" + slot.getTrainerId())
                        .build());
            }
        }

        return timetableEntries;
    }
}
