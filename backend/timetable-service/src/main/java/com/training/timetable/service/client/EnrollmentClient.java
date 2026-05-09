package com.training.timetable.service.client;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "enrollment-service", path = "/api/enrollments")
public interface EnrollmentClient {

    @GetMapping("/student/{studentId}")
    List<EnrollmentView> getEnrollmentsByStudent(@PathVariable("studentId") Long studentId);

    @Getter
    @Setter
    class EnrollmentView {
        private Long id;
        private Long studentId;
        private Long courseId;
    }
}
