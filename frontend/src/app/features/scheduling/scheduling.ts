import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import {
  ApiService,
  CourseResponseDTO,
  ModuleResponseDTO,
  ScheduleResponseDTO,
  TimeslotResponseDTO,
  UserResponseDTO,
  WeekDay,
} from '../../core/services/api';
import { Navbar } from '../../shared/navbar/navbar';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { SlotAssignmentDialog } from './slot-assignment-dialog';

@Component({
  selector: 'app-scheduling',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    Navbar,
    Sidebar,
  ],
  templateUrl: './scheduling.html',
  styleUrl: './scheduling.css',
  standalone: true
})
export class Scheduling {
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly courses = signal<CourseResponseDTO[]>([]);
  readonly trainers = signal<UserResponseDTO[]>([]);
  readonly modules = signal<ModuleResponseDTO[]>([]);
  readonly schedules = signal<ScheduleResponseDTO[]>([]);
  readonly selectedScheduleId = signal<number | null>(null);
  readonly scheduleExists = signal(false);
  readonly timeslots = signal<TimeslotResponseDTO[]>([]);
  readonly errorMessage = signal<string>('');
  readonly hasSearched = signal(false);  // ← ADD KARO YAHAN
  readonly weekdays: WeekDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  readonly fixedSlots = [
    { label: '8 AM - 11 AM', key: '8-11', start: '08:00', end: '11:00' },
    { label: '11 AM - 2 PM', key: '11-2', start: '11:00', end: '14:00' },
    { label: '2 PM - 5 PM', key: '2-5', start: '14:00', end: '17:00' },
    { label: '5 PM - 8 PM', key: '5-8', start: '17:00', end: '20:00' },
  ];
  readonly dayLabels: Record<WeekDay, string> = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday',
  };

  readonly scheduleForm = this.fb.group({
    courseId: [null as number | null, Validators.required],
    weekStartDate: ['', Validators.required],
  });

  constructor(
    private readonly api: ApiService,
    private readonly snack: MatSnackBar,
    private readonly dialog: MatDialog
  ) {
    this.loadReferenceData();
  }

  createSchedule() {
    console.log("Form Values:", this.scheduleForm.value);
    console.log("Form Valid:", this.scheduleForm.valid);

    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      this.snack.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    const payload = {
      courseId: Number(this.scheduleForm.value.courseId),
      weekStartDate: this.scheduleForm.value.weekStartDate ?? '',
    };

    console.log("POST payload:", payload);

    this.loading.set(true);
    this.errorMessage.set('');

    this.api.createSchedule(payload).subscribe({
      next: (schedule) => {
        console.log('SUCCESS:', schedule);

        // ✅ UPDATE LOCAL STATE & SELECT
        this.schedules.update(list => [...list, schedule]);
        this.selectSchedule(schedule.id);

        // ✅ SUCCESS MESSAGE
        this.snack.open('✅ Schedule created successfully', 'Close', { duration: 2500 });

        // ✅ FIX: STOP LOADING
        this.loading.set(false);
      },

      error: (err) => {
        console.error("FULL ERROR:", err);

        const message =
          err?.error?.message ||
          err?.error ||
          err?.message ||
          'Something went wrong';

        this.snack.open(message, 'Close', { duration: 4000 });

        this.loading.set(false);
      }
    });
  }

  private handleBackendError(err: any): string {
    console.log("Backend Error:", err);

    if (err?.error?.message) return err.error.message;

    if (typeof err?.error === 'string') return err.error;

    if (err?.status === 400) return 'Invalid request data';
    if (err?.status === 401) return 'Please login again';
    if (err?.status === 403) return 'Access denied';
    if (err?.status === 404) return 'Data not found';

    return 'Server error occurred';
  }
  onCourseChange() {
    const courseId = Number(this.scheduleForm.controls.courseId.value ?? 0);

    this.selectedScheduleId.set(null);
    this.scheduleExists.set(false);
    this.timeslots.set([]);
    this.schedules.set([]);

    if (courseId <= 0) {
      this.modules.set([]);
      this.loading.set(false); // ✅ IMPORTANT
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.loadModulesByCourse(courseId);
  }

  getSchedule() {
    this.hasSearched.set(true); // ← ADD KARO
    const courseId = Number(this.scheduleForm.controls.courseId.value ?? 0);
    if (courseId <= 0) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.api.getScheduleByCourse(courseId).subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);

        if (schedules.length === 0) {
           this.scheduleExists.set(false);
           this.selectedScheduleId.set(null);
           this.snack.open('No schedules found', 'Close', { duration: 3000 });
        }

        this.loading.set(false);
      },
      error: (err) => {
        if (err?.status === 404) {
          this.scheduleExists.set(false);
          this.schedules.set([]);
          this.snack.open('Data not found', 'Close', { duration: 3000 });
        } else {
          console.error(err);
          this.snack.open(this.handleBackendError(err), 'Close', { duration: 3000 });
        }
        this.loading.set(false);
      },
    });
  }

  selectSchedule(scheduleId: number) {
    this.selectedScheduleId.set(scheduleId);
    this.scheduleExists.set(true);
    this.loading.set(true);
    this.loadTimeslots(scheduleId);
  }

  deleteSchedule(scheduleId: number) {
    if (!confirm('Are you sure you want to delete this schedule? All tied timeslots will be destroyed permanently.')) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.api.deleteSchedule(scheduleId).subscribe({
      next: () => {
        this.snack.open('✅ Schedule deleted', 'Close', { duration: 2500 });
        this.selectedScheduleId.set(null);
        this.scheduleExists.set(false);
        this.timeslots.set([]);
        this.getSchedule();
      },
      error: (err) => {
        console.error(err);
        this.snack.open(this.handleBackendError(err), 'Close', { duration: 4000 });
        this.loading.set(false);
      }
    });
  }

  assignSlot(day: WeekDay, startTime: string, endTime: string, slotLabel: string) {
    const scheduleId = this.selectedScheduleId();
    if (!scheduleId) {
      this.snack.open('Create a schedule first.', 'Close', { duration: 2500 });
      return;
    }
    if (this.modules().length === 0) {
      this.snack.open('No modules found for selected course.', 'Close', { duration: 3000 });
      return;
    }

    const ref = this.dialog.open(SlotAssignmentDialog, {
      width: '520px',
      data: {
        dayLabel: this.dayLabels[day],
        timeLabel: slotLabel,
        modules: this.modules(),
        trainers: this.trainers(),
      },
    });
    ref.afterClosed().subscribe((selection) => {
      if (!selection) return;
      this.loading.set(true);
      this.api
        .createTimeslot({
          scheduleId,
          dayOfWeek: day,
          startTime,
          endTime,
          moduleId: selection.moduleId,
          trainerId: selection.trainerId,
        })
        .subscribe({
          next: () => {
            this.snack.open('Slot assigned successfully.', 'Close', { duration: 2500 });
            this.loadTimeslots(scheduleId);
          },
          error: (err) => {
            console.error(err);
            this.snack.open('Something went wrong', 'Close', { duration: 3000 });
            this.loading.set(false);
          },
        });
    });
  }

  getSlotText(day: WeekDay, startTime: string, endTime: string) {
    const slot = this.findSlot(day, startTime, endTime);
    if (!slot) return '+';
    const moduleName = this.modules().find((m) => m.id === slot.moduleId)?.name ?? 'Module';
    const trainerName = this.trainers().find((t) => t.id === slot.trainerId)?.name ?? 'Trainer';
    return `${moduleName} | ${trainerName}`;
  }

  isSlotFilled(day: WeekDay, startTime: string, endTime: string) {
    return !!this.findSlot(day, startTime, endTime);
  }

  private loadReferenceData() {
    this.loading.set(true);
    forkJoin({
      courses: this.api.getCourses(),
      users: this.api.getUsers(),
    }).subscribe({
      next: ({ courses, users }) => {
        this.courses.set(courses);
        this.trainers.set(users.filter((u) => u.role === 'TRAINER'));
      },
      error: (err) => {
        console.error(err);
        this.snack.open('Something went wrong', 'Close', { duration: 3000 });
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadTimeslots(scheduleId: number) {
    this.api.getTimeslotsBySchedule(scheduleId).subscribe({
      next: (slots) => this.timeslots.set(slots),
      error: (err) => {
        console.error(err);
        this.snack.open('Something went wrong', 'Close', { duration: 3000 });
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadModulesByCourse(courseId: number) {
    this.api.getModulesByCourse(courseId).subscribe({
      next: (modules) => this.modules.set(modules),
      error: (err) => {
        console.error(err);
        this.modules.set([]);
      },
      complete: () => this.loading.set(false)   // ✅ FIX
    });
  }

  private findSlot(day: WeekDay, startTime: string, endTime: string) {
    return this.timeslots().find(
      (s) =>
        s.dayOfWeek === day &&
        (s.startTime?.startsWith(startTime) ?? false) &&
        (s.endTime?.startsWith(endTime) ?? false)
    );
  }
}
