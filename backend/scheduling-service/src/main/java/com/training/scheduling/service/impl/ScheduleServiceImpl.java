package com.training.scheduling.service.impl;

import com.training.scheduling.dto.request.ScheduleRequestDTO;
import com.training.scheduling.dto.request.TimeSlotRequestDTO;
import com.training.scheduling.dto.response.CourseLookupResponseDTO;
import com.training.scheduling.dto.response.ScheduleResponseDTO;
import com.training.scheduling.dto.response.TimeSlotResponseDTO;
import com.training.scheduling.entity.Schedule;
import com.training.scheduling.entity.TimeSlot;
import com.training.scheduling.exception.BadRequestException;
import com.training.scheduling.exception.ResourceNotFoundException;
import com.training.scheduling.repository.ScheduleRepository;
import com.training.scheduling.repository.TimeSlotRepository;
import com.training.scheduling.service.ScheduleService;
import com.training.scheduling.service.client.CourseClient;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import feign.FeignException;
import org.springframework.stereotype.Service;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final CourseClient courseClient;

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ScheduleResponseDTO createSchedule(ScheduleRequestDTO request) {
        LocalDate parsedWeekStartDate = LocalDate.parse(request.getWeekStartDate());



        scheduleRepository.findByCourseIdAndWeekStartDate(request.getCourseId(), parsedWeekStartDate)
                .ifPresent(existing -> {
                    throw new BadRequestException(
                            "Schedule already exists for course " + request.getCourseId() + " and week start date: " + request.getWeekStartDate()
                    );
                });

        Schedule schedule = Schedule.builder()
                .courseId(request.getCourseId())
                .weekStartDate(parsedWeekStartDate)
                .build();

        Schedule saved = scheduleRepository.save(schedule);
        return toScheduleResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER','TRAINEE')")
    public ScheduleResponseDTO getScheduleById(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));
        return toScheduleResponse(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER','TRAINEE')")
    public List<ScheduleResponseDTO> getScheduleByCourse(Long courseId) {
        List<Schedule> schedules = scheduleRepository.findAllByCourseId(courseId);
        return schedules.stream()
                .map(this::toScheduleResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSchedule(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));
        scheduleRepository.delete(schedule);
    }

    @Override
    @Transactional
    public TimeSlotResponseDTO createTimeSlot(TimeSlotRequestDTO request) {
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + request.getScheduleId()));

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("Invalid slot time range. startTime must be before endTime.");
        }

        TimeSlot slot = TimeSlot.builder()
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .moduleId(request.getModuleId())
                .trainerId(request.getTrainerId())
                .schedule(schedule)
                .build();

        TimeSlot saved = timeSlotRepository.save(slot);
        return toTimeSlotResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER','TRAINEE')")
    public List<TimeSlotResponseDTO> getSlotsBySchedule(Long scheduleId) {
        if (!scheduleRepository.existsById(scheduleId)) {
            throw new ResourceNotFoundException("Schedule not found with id: " + scheduleId);
        }

        return timeSlotRepository.findByScheduleId(scheduleId).stream()
                .map(this::toTimeSlotResponse)
                .toList();
    }

    private ScheduleResponseDTO toScheduleResponse(Schedule schedule) {
        return ScheduleResponseDTO.builder()
                .id(schedule.getId())
                .courseId(schedule.getCourseId())
                .weekStartDate(schedule.getWeekStartDate())
                .build();
    }

    private TimeSlotResponseDTO toTimeSlotResponse(TimeSlot slot) {
        return TimeSlotResponseDTO.builder()
                .id(slot.getId())
                .dayOfWeek(slot.getDayOfWeek())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .moduleId(slot.getModuleId())
                .trainerId(slot.getTrainerId())
                .build();
    }
}
