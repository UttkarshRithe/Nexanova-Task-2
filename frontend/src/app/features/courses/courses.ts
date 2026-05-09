import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiService, CourseResponseDTO } from '../../core/services/api';
import { Navbar } from '../../shared/navbar/navbar';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { CourseFormDialog } from './course-form-dialog';

@Component({
  selector: 'app-courses',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    Navbar,
    Sidebar,
  ],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {
  readonly loading = signal(false);
  readonly courses = signal<CourseResponseDTO[]>([]);
  readonly displayedColumns = ['id', 'name', 'description', 'duration', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly snack: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  openAddCourseDialog() {
    const ref = this.dialog.open(CourseFormDialog, { width: '640px', data: null });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.loading.set(true);
      this.api.createCourse(payload).subscribe({
        next: () => {
          this.snack.open('Course created successfully.', 'Close', { duration: 2500 });
          this.loadCourses();
        },
        error: () => {
          this.snack.open('Failed to create course.', 'Close', { duration: 4000 });
          this.loading.set(false);
        },
      });
    });
  }

  openEditCourseDialog(course: CourseResponseDTO) {
    const ref = this.dialog.open(CourseFormDialog, { width: '640px', data: course });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.loading.set(true);
      this.api.updateCourse(course.id, payload).subscribe({
        next: () => {
          this.snack.open('Course updated successfully.', 'Close', { duration: 2500 });
          this.loadCourses();
        },
        error: () => {
          this.snack.open('Failed to update course.', 'Close', { duration: 4000 });
          this.loading.set(false);
        },
      });
    });
  }

  deleteCourse(courseId: number) {
    this.loading.set(true);
    this.api.deleteCourse(courseId).subscribe({
      next: () => {
        this.snack.open('Course deleted.', 'Close', { duration: 2500 });
        this.loadCourses();
      },
      error: () => {
        this.snack.open('Failed to delete course.', 'Close', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  private loadCourses() {
    this.loading.set(true);
    this.api.getCourses().subscribe({
      next: (data) => this.courses.set(data),
      error: () => this.snack.open('Failed to load courses.', 'Close', { duration: 4000 }),
      complete: () => this.loading.set(false),
    });
  }
}
