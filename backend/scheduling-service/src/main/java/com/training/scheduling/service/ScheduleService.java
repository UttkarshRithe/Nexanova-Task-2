package com.training.scheduling.service;

import com.training.scheduling.dto.request.ScheduleRequestDTO;
import com.training.scheduling.dto.request.TimeSlotRequestDTO;
import com.training.scheduling.dto.response.ScheduleResponseDTO;
import com.training.scheduling.dto.response.TimeSlotResponseDTO;
import java.util.List;

public interface ScheduleService {

    ScheduleResponseDTO createSchedule(ScheduleRequestDTO request);

    ScheduleResponseDTO getScheduleById(Long scheduleId);

    List<ScheduleResponseDTO> getScheduleByCourse(Long courseId);

    TimeSlotResponseDTO createTimeSlot(TimeSlotRequestDTO request);

    List<TimeSlotResponseDTO> getSlotsBySchedule(Long scheduleId);

    void deleteSchedule(Long scheduleId);
}
