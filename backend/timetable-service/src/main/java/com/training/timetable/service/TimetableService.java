package com.training.timetable.service;

import com.training.timetable.dto.response.TimetableResponseDTO;
import java.util.List;

public interface TimetableService {

    List<TimetableResponseDTO> getStudentTimetable(Long studentId);
}
