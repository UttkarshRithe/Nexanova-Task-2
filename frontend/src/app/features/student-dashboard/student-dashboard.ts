import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiService, CourseResponseDTO, ScheduleResponseDTO, TimetableEntryDTO, WeekDay } from '../../core/services/api';
import { AuthService } from '../../core/services/auth';
import { Navbar } from '../../shared/navbar/navbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-student-dashboard',
  imports: [
    CommonModule,
    Navbar,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard {
  readonly loading = signal(false);
  readonly studentId = signal<number>(1);
  readonly myCourses = signal<CourseResponseDTO[]>([]);
  readonly timetable = signal<TimetableEntryDTO[]>([]);
  readonly weekdays: WeekDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  readonly fixedSlots = [
    { label: '8 AM - 11 AM', start: '08:00', end: '11:00' },
    { label: '11 AM - 2 PM', start: '11:00', end: '14:00' },
    { label: '2 PM - 5 PM', start: '14:00', end: '17:00' },
    { label: '5 PM - 8 PM', start: '17:00', end: '20:00' },
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

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly snack: MatSnackBar
  ) {
    const jwtUserId = this.auth.getUserId();
    const localId = Number(localStorage.getItem('tms_student_id') ?? 0);
    this.studentId.set(jwtUserId ?? (localId > 0 ? localId : 1));
    this.load();
  }

  setStudentId(value: string) {
    const id = Number(value);
    if (!Number.isFinite(id) || id <= 0) return;
    this.studentId.set(id);
    localStorage.setItem('tms_student_id', String(id));
  }

  load() {
    this.loading.set(true);
    this.myCourses.set([]);
    this.timetable.set([]);

    this.api.getEnrollmentsByStudent(this.studentId()).subscribe({
      next: (enrollments) => {
        if (enrollments.length === 0) {
          this.loading.set(false);
          return;
        }

        const validEnrollments = enrollments.filter(
          e => !!e.scheduleId && Number(e.scheduleId) > 0
        );
        const courseIds = Array.from(new Set(enrollments.map(e => e.courseId)));

        forkJoin({
          courses: this.api.getCourses().pipe(catchError(() => of([]))),
          users: this.api.getUsers().pipe(catchError(() => of([]))),
          modules: forkJoin(
            courseIds.map(cId =>
              this.api.getModulesByCourse(cId).pipe(catchError(() => of([])))
            )
          ).pipe(catchError(() => of([]))),
        }).subscribe({
          next: ({ courses, users, modules }) => {

            // My Courses
            const myCourses = (courses as any[]).filter(c => courseIds.includes(c.id));
            this.myCourses.set(
              myCourses.length > 0
                ? myCourses
                : enrollments.map(e => ({
                  id: e.courseId,
                  name: `Course ${e.courseId}`,
                  description: null,
                }))
            );

            // Module map: moduleId → name
            const allModules = (modules as any[][]).flat();
            const moduleMap = new Map<number, string>(
              allModules.map((m: any) => [m.id, m.name])
            );

            // Trainer map: userId → name
            const trainerMap = new Map<number, string>(
              (users as any[]).map((u: any) => [u.id, u.name])
            );

            // Course map: courseId → name
            const courseMap = new Map<number, string>(
              (courses as any[]).map((c: any) => [c.id, c.name])
            );

            if (validEnrollments.length === 0) {
              this.timetable.set([]);
              this.loading.set(false);
              return;
            }

            const scheduleToCoursMap = new Map(
              validEnrollments.map(e => [e.scheduleId, e.courseId])
            );
            const uniqueScheduleIds = Array.from(
              new Set(validEnrollments.map(e => e.scheduleId))
            );

            forkJoin(
              uniqueScheduleIds.map(scheduleId =>
                this.api.getTimeslotsBySchedule(scheduleId).pipe(
                  catchError(() => of([]))
                )
              )
            ).subscribe({
              next: (slotsBySchedule) => {
                const rows: TimetableEntryDTO[] = [];

                uniqueScheduleIds.forEach((scheduleId, idx) => {
                  const slots = (slotsBySchedule[idx] as any[]) ?? [];
                  const courseId = scheduleToCoursMap.get(scheduleId);
                  const courseName = courseMap.get(courseId!) ?? `Course ${courseId}`;

                  slots.forEach((slot: any) => {
                    const normalized = this.normalizeTimeslot(slot.startTime, slot.endTime);
                    const moduleName = slot.moduleId
                      ? (moduleMap.get(slot.moduleId) ?? `Module ${slot.moduleId}`)
                      : courseName;
                    const trainerName = slot.trainerId
                      ? (trainerMap.get(slot.trainerId) ?? `Trainer ${slot.trainerId}`)
                      : '';

                    rows.push({
                      day: slot.dayOfWeek,
                      startTime: normalized.startTime,
                      endTime: normalized.endTime,
                      courseName: trainerName
                        ? `${moduleName} | ${trainerName}`
                        : moduleName,
                    });
                  });
                });

                this.timetable.set(rows);
                this.loading.set(false);
              },
              error: (err) => {
                this.snack.open(
                  err?.error?.message || 'Failed to load timetable',
                  'Close', { duration: 3000 }
                );
                this.loading.set(false);
              },
            });
          },
          error: (err) => {
            this.snack.open(
              err?.error?.message || 'Failed to load data',
              'Close', { duration: 3000 }
            );
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.snack.open(
          err?.error?.message || 'Failed to load enrollments',
          'Close', { duration: 3000 }
        );
        this.loading.set(false);
      },
    });
  }

  printTimetable() {
    const studentName = `Student ${this.studentId()}`;
    const printContent = document.getElementById('timetable-pdf');
    if (!printContent) return;

    const win = window.open('', '_blank', 'width=900,height=650');
    if (!win) return;

    win.document.write(`
    <html>
      <head>
        <title>Timetable - ${studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h2 { margin-bottom: 4px; }
          p  { margin: 0 0 16px; color: #555; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 10px 14px; text-align: left; font-size: 13px; }
          th { background: #f0f4ff; font-weight: 600; }
          tr:nth-child(even) td { background: #fafafa; }
        </style>
      </head>
      <body>
        <h2>Weekly Timetable</h2>
        <p>Student ID: ${this.studentId()}</p>
        ${printContent.innerHTML}
        <script>window.onload = function(){ window.print(); window.close(); }<\/script>
      </body>
    </html>
  `);
    win.document.close();
  }

  getSlotText(day: WeekDay, start: string, end: string) {
    const slot = this.timetable().find(
      (t) => t.day === day && (t.startTime?.startsWith(start) ?? false) && (t.endTime?.startsWith(end) ?? false)
    );
    if (!slot) return 'Empty';
    return slot.courseName;
  }

  private normalizeTimeslot(startTime?: string, endTime?: string) {
    if (startTime && endTime) return { startTime, endTime };
    return { startTime: '08:00', endTime: '11:00' };
  }
}
