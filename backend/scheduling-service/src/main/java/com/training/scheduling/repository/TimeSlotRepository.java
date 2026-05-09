package com.training.scheduling.repository;

import com.training.scheduling.entity.TimeSlot;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional(readOnly = true)
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByScheduleId(Long scheduleId);

    List<TimeSlot> findByTrainerId(Long trainerId);
}
