import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ApiService,
  CourseResponseDTO,
  ScheduleResponseDTO,
  UserResponseDTO,
} from '../../core/services/api';

@Component({
  selector: 'app-enroll-student-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Enroll Student</h2>
    <div mat-dialog-content>
      <form [formGroup]="form" class="grid grid-cols-1 gap-3 pt-2">

        <mat-form-field appearance="outline">
          <mat-label>Student</mat-label>
          <mat-select formControlName="studentId">
            <mat-option *ngFor="let s of students()" [value]="s.id">
              {{ s.name }} ({{ s.email }})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Course</mat-label>
          <mat-select formControlName="courseId" (selectionChange)="onCourseChange($event.value)">
            <mat-option *ngFor="let c of courses()" [value]="c.id">
              {{ c.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="schedules().length > 0">
          <mat-label>Schedule (Batch)</mat-label>
          <mat-select formControlName="scheduleId">
            <mat-option *ngFor="let s of schedules()" [value]="s.id">
              Schedule #{{ s.id }} — Start: {{ s.weekStartDate }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div *ngIf="schedulesLoading()" class="text-sm app-muted">
          Loading schedules...
        </div>

        <div *ngIf="noSchedules()" class="text-sm text-red-500">
          No schedules found for this course. Create a schedule first.
        </div>

      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()"
              [disabled]="form.invalid || schedules().length === 0">
        Enroll
      </button>
    </div>
  `,
})
export class EnrollStudentDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snack = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<EnrollStudentDialog>);

  readonly students = signal<UserResponseDTO[]>([]);
  readonly courses = signal<CourseResponseDTO[]>([]);
  readonly schedules = signal<ScheduleResponseDTO[]>([]);
  readonly schedulesLoading = signal(false);
  readonly noSchedules = signal(false);

  readonly form = this.fb.group({
    studentId:  [null as number | null, [Validators.required]],
    courseId:   [null as number | null, [Validators.required]],
    scheduleId: [null as number | null, [Validators.required]],
  });

  constructor() {
    this.api.getUsers().subscribe({
      next: (users) => this.students.set(users.filter((u) => u.role === 'TRAINEE')),
      error: () => this.snack.open('Failed to load students', 'Close', { duration: 3000 }),
    });
    this.api.getCourses().subscribe({
      next: (courses) => this.courses.set(courses),
      error: () => this.snack.open('Failed to load courses', 'Close', { duration: 3000 }),
    });
  }

  onCourseChange(courseId: number) {
    this.schedules.set([]);
    this.noSchedules.set(false);
    this.form.patchValue({ scheduleId: 0 });

    if (!courseId || courseId <= 0) return;

    this.schedulesLoading.set(true);
    this.api.getScheduleByCourse(courseId).subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.noSchedules.set(data.length === 0);
        this.schedulesLoading.set(false);
      },
      error: () => {
        this.noSchedules.set(true);
        this.schedulesLoading.set(false);
      },
    });
  }

  close() { this.dialogRef.close(null); }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      studentId:  Number(raw.studentId),
      courseId:   Number(raw.courseId),
      scheduleId: Number(raw.scheduleId),
    });
  }
}
