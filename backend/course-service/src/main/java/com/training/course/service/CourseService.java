package com.training.course.service;

import com.training.course.dto.request.CourseRequestDTO;
import com.training.course.dto.request.ModuleRequestDTO;
import com.training.course.dto.response.CourseResponseDTO;
import com.training.course.dto.response.ModuleResponseDTO;
import java.util.List;

public interface CourseService {

    CourseResponseDTO createCourse(CourseRequestDTO request);

    CourseResponseDTO updateCourse(Long courseId, CourseRequestDTO request);

    void deleteCourse(Long courseId);

    List<CourseResponseDTO> getAllCourses();

    CourseResponseDTO getCourseById(Long courseId);

    ModuleResponseDTO addModule(Long courseId, ModuleRequestDTO request);

    List<ModuleResponseDTO> getModulesByCourse(Long courseId);
}
