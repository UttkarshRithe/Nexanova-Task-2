package com.training.scheduling.repository;

import com.training.scheduling.entity.Schedule;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional(readOnly = true)
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    Optional<Schedule> findByWeekStartDate(LocalDate date);

    List<Schedule> findAllByCourseId(Long courseId);

    Optional<Schedule> findByCourseIdAndWeekStartDate(Long courseId, LocalDate date);
}
