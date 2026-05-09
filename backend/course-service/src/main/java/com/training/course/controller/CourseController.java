package com.training.course.controller;

import com.training.course.dto.request.CourseRequestDTO;
import com.training.course.dto.request.ModuleRequestDTO;
import com.training.course.dto.response.CourseResponseDTO;
import com.training.course.dto.response.ModuleResponseDTO;
import com.training.course.service.CourseService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    public ResponseEntity<CourseResponseDTO> createCourse(@Valid @RequestBody CourseRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(request));
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponseDTO> updateCourse(
            @PathVariable("courseId") Long courseId,
            @Valid @RequestBody CourseRequestDTO request
    ) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, request));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable("courseId") Long courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CourseResponseDTO>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponseDTO> getCourseById(@PathVariable("courseId") Long courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @PostMapping("/modules")
    public ResponseEntity<ModuleResponseDTO> addModule(
            @RequestParam("courseId") Long courseId,
            @Valid @RequestBody ModuleRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.addModule(courseId, request));
    }

    @GetMapping("/{courseId}/modules")
    public ResponseEntity<List<ModuleResponseDTO>> getModulesByCourse(@PathVariable("courseId") Long courseId) {
        return ResponseEntity.ok(courseService.getModulesByCourse(courseId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ModuleResponseDTO>> getModulesByCourseAlias(@PathVariable("courseId") Long courseId) {
        return getModulesByCourse(courseId);
    }
}

