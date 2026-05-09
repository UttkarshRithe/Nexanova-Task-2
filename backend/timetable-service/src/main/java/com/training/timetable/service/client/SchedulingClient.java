package com.training.timetable.service.client;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "scheduling-service", path = "/api/schedule")
public interface SchedulingClient {

    @GetMapping("/{scheduleId}/timeslots")
    List<TimeSlotView> getSlotsBySchedule(@PathVariable("scheduleId") Long scheduleId);

    @Getter
    @Setter
    class TimeSlotView {
        private Long id;
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private Long moduleId;
        private Long trainerId;
    }
}
