package com.training.scheduling.controller;

import com.training.scheduling.dto.request.ScheduleRequestDTO;
import com.training.scheduling.dto.request.TimeSlotRequestDTO;
import com.training.scheduling.dto.response.ScheduleResponseDTO;
import com.training.scheduling.dto.response.TimeSlotResponseDTO;
import com.training.scheduling.exception.BadRequestException;
import com.training.scheduling.exception.ResourceNotFoundException;
import com.training.scheduling.service.ScheduleService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class SchedulingController {

    private final ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<ScheduleResponseDTO> createSchedule(@RequestBody ScheduleRequestDTO request) {
        ScheduleResponseDTO response = scheduleService.createSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<ScheduleResponseDTO> getScheduleById(
            @PathVariable("scheduleId") Long scheduleId) {
        try {
            return ResponseEntity.ok(scheduleService.getScheduleById(scheduleId));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ScheduleResponseDTO>> getScheduleByCourse(
            @PathVariable("courseId") Long courseId) {
        try {
            return ResponseEntity.ok(scheduleService.getScheduleByCourse(courseId));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable("scheduleId") Long scheduleId) {
        try {
            scheduleService.deleteSchedule(scheduleId);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/timeslots")
    public ResponseEntity<TimeSlotResponseDTO> createTimeSlot(
            @jakarta.validation.Valid @RequestBody TimeSlotRequestDTO request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(scheduleService.createTimeSlot(request));
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{scheduleId}/timeslots")
    public ResponseEntity<List<TimeSlotResponseDTO>> getSlotsBySchedule(
            @PathVariable("scheduleId") Long scheduleId) {
        try {
            return ResponseEntity.ok(scheduleService.getSlotsBySchedule(scheduleId));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/timeslots/{scheduleId}")
    public ResponseEntity<List<TimeSlotResponseDTO>> getSlotsByScheduleAlias(
            @PathVariable("scheduleId") Long scheduleId) {
        return getSlotsBySchedule(scheduleId);
    }
}

