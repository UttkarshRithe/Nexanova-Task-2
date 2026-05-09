package com.training.course.service.impl;

import com.training.course.dto.request.CourseRequestDTO;
import com.training.course.dto.request.ModuleRequestDTO;
import com.training.course.dto.response.CourseResponseDTO;
import com.training.course.dto.response.ModuleResponseDTO;
import com.training.course.entity.Course;
import com.training.course.entity.Module;
import com.training.course.exception.BadRequestException;
import com.training.course.exception.ResourceNotFoundException;
import com.training.course.repository.CourseRepository;
import com.training.course.repository.ModuleRepository;
import com.training.course.service.CourseService;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponseDTO createCourse(CourseRequestDTO request) {
        if (courseRepository.existsByName(request.getName())) {
            throw new BadRequestException("Course name already exists: " + request.getName());
        }

        Course course = Course.builder()
                .name(request.getName())
                .description(request.getDescription())
                .duration(request.getDuration())
                .build();

        Course saved = courseRepository.save(course);

        upsertModules(saved, request.getModules());

        return toCourseResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponseDTO updateCourse(Long courseId, CourseRequestDTO request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (!course.getName().equalsIgnoreCase(request.getName()) && courseRepository.existsByName(request.getName())) {
            throw new BadRequestException("Course name already exists: " + request.getName());
        }

        course.setName(request.getName());
        course.setDescription(request.getDescription());
        course.setDuration(request.getDuration());

        // orphanRemoval=true ensures old module rows are deleted.
        course.getModules().clear();
        upsertModules(course, request.getModules());

        Course saved = courseRepository.save(course);
        return toCourseResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        courseRepository.delete(course);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER','TRAINEE')")
    public List<CourseResponseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toCourseResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER','TRAINEE')")
    public CourseResponseDTO getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        return toCourseResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'TRAINEE')")
    public List<ModuleResponseDTO> getModulesByCourse(Long courseId) {
        courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        return moduleRepository.findByCourseId(courseId).stream()
                .map(this::toModuleResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ModuleResponseDTO addModule(Long courseId, ModuleRequestDTO request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Module name is required.");
        }
        if (moduleRepository.existsByCourseIdAndNameIgnoreCase(courseId, request.getName())) {
            throw new BadRequestException("Module name already exists in this course: " + request.getName());
        }

        Module module = Module.builder()
                .name(request.getName())
                .description(request.getDescription())
                .course(course)
                .build();

        Module saved = moduleRepository.save(module);
        return toModuleResponse(saved);
    }

    private CourseResponseDTO toCourseResponse(Course course) {
        return CourseResponseDTO.builder()
                .id(course.getId())
                .name(course.getName())
                .description(course.getDescription())
                .duration(course.getDuration())
                .build();
    }

    private ModuleResponseDTO toModuleResponse(Module module) {
        return ModuleResponseDTO.builder()
                .id(module.getId())
                .name(module.getName())
                .description(module.getDescription())
                .courseId(module.getCourse().getId())
                .build();
    }

    private void upsertModules(Course course, List<ModuleRequestDTO> moduleRequests) {
        if (moduleRequests == null || moduleRequests.isEmpty()) {
            return;
        }

        Set<String> uniqueNames = new HashSet<>();
        for (ModuleRequestDTO m : moduleRequests) {
            if (m == null || m.getName() == null || m.getName().isBlank()) {
                continue;
            }

            String normalized = m.getName().trim().toLowerCase();
            if (!uniqueNames.add(normalized)) {
                continue;
            }

            Module module = Module.builder()
                    .name(m.getName().trim())
                    .description(m.getDescription())
                    .course(course)
                    .build();

            course.getModules().add(module);
        }
    }
}
