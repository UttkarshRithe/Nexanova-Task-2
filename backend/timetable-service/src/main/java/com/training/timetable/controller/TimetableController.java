package com.training.timetable.controller;

import com.training.timetable.dto.response.TimetableResponseDTO;
import com.training.timetable.exception.BadRequestException;
import com.training.timetable.service.TimetableService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TimetableResponseDTO>> getStudentTimetable(@PathVariable Long studentId) {
        try {
            return ResponseEntity.ok(timetableService.getStudentTimetable(studentId));
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}

