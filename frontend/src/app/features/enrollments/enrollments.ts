import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiService, EnrollmentResponseDTO } from '../../core/services/api';
import { Navbar } from '../../shared/navbar/navbar';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { EnrollStudentDialog } from './enroll-student-dialog';

@Component({
  selector: 'app-enrollments',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    Navbar,
    Sidebar,
  ],
  templateUrl: './enrollments.html',
  styleUrl: './enrollments.css',
})
export class Enrollments {
  readonly loading = signal(false);
  readonly studentId = signal<number>(1);
  readonly enrollments = signal<EnrollmentResponseDTO[]>([]);
  readonly displayedColumns = ['id', 'studentId', 'courseId', 'enrolledAt'];

  constructor(
    private readonly api: ApiService,
    private readonly snack: MatSnackBar,
    private readonly dialog: MatDialog
  ) {
  }

  setStudentId(value: string) {
    const id = Number(value);
    if (!Number.isFinite(id) || id <= 0) return;
    this.studentId.set(id);
  }

  load() {
    this.loading.set(true);
    this.api.getEnrollmentsByStudent(this.studentId()).subscribe({
      next: (data) => this.enrollments.set(data),
      error: (err) => {
        console.error(err);
        // CHANGE THIS LINE
        const msg = err?.error?.message || err?.message || 'Something went wrong';
        this.snack.open(msg, 'Close', {duration: 3000});
        this.loading.set(false); // ADD THIS LINE
      },
      complete: () => this.loading.set(false),
    });
  }

  openEnrollDialog() {
    const ref = this.dialog.open(EnrollStudentDialog, {width: '620px'});
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.loading.set(true);
      this.api.enrollStudent(payload).subscribe({
        next: () => {
          this.snack.open('Student enrolled successfully.', 'Close', {duration: 2500});
          this.studentId.set(payload.studentId);
          this.load();
        },
        error: (err) => {
          console.error(err);
          // CHANGE THIS LINE
          const msg = err?.error?.message || err?.message || 'Something went wrong';
          this.snack.open(msg, 'Close', {duration: 3000});
          this.loading.set(false);
        },
      });
    });
  }
}
