package com.training.scheduling.service.client;

import com.training.scheduling.config.FeignConfig;
import com.training.scheduling.dto.response.CourseLookupResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "course-service", configuration = FeignConfig.class)
public interface CourseClient {

    @GetMapping("/api/courses/{courseId}")
    CourseLookupResponseDTO getCourseById(@PathVariable("courseId") Long courseId);
}
