import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { forkJoin, of, switchMap } from 'rxjs';
import { ApiService, CourseResponseDTO, EnrollmentResponseDTO, UserResponseDTO } from '../../core/services/api';
import { Navbar } from '../../shared/navbar/navbar';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    NgChartsModule,
    Navbar,
    Sidebar,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  standalone: true
})
export class AdminDashboard implements OnInit {
  readonly loading = signal(true);

  readonly users = signal<UserResponseDTO[]>([]);
  readonly courses = signal<CourseResponseDTO[]>([]);
  readonly enrollmentsForStudent = signal<EnrollmentResponseDTO[]>([]);
  readonly selectedStudentId = signal<number>(1);

  readonly totalUsers = signal(0);
  readonly totalCourses = signal(0);
  readonly totalEnrollments = signal(0);

  // Charts
  lineChartType: ChartType = 'line';
  barChartType: ChartType = 'bar';
  pieChartType: ChartType = 'pie';

  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true } },
  };

  constructor(private readonly api: ApiService, private readonly snack: MatSnackBar) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    forkJoin({
      users: this.api.getUsers(),
      courses: this.api.getCourses(),
    })
      .pipe(
        switchMap(({ users, courses }) => {
          this.users.set(users);
          this.courses.set(courses);
          this.totalUsers.set(users.length);
          this.totalCourses.set(courses.length);

          const studentId = this.selectedStudentId();
          return this.api.getEnrollmentsByStudent(studentId).pipe(
            switchMap((enrollments) => {
              this.enrollmentsForStudent.set(enrollments);
              this.totalEnrollments.set(enrollments.length);
              return of({ users, courses, enrollments });
            })
          );
        })
      )
      .subscribe({
        next: ({ users, courses, enrollments }) => {
          this.buildCharts(users, courses, enrollments);
        },
        error: () => {
          this.snack.open('Failed to load admin dashboard data.', 'Close', { duration: 4000 });
        },
        complete: () => this.loading.set(false),
      });
  }

  setStudentId(value: string) {
    const id = Number(value);
    if (!Number.isFinite(id) || id <= 0) return;
    this.selectedStudentId.set(id);
    this.refresh();
  }

  private buildCharts(users: UserResponseDTO[], courses: CourseResponseDTO[], enrollments: EnrollmentResponseDTO[]) {
    // Users Growth (group by YYYY-MM from createdAt)
    const buckets = new Map<string, number>();
    for (const u of users) {
      const d = new Date(u.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const labels = Array.from(buckets.keys()).sort();
    this.lineChartData = {
      labels,
      datasets: [{ data: labels.map((l) => buckets.get(l) ?? 0), label: 'New Users', fill: false, tension: 0.2 }],
    };

    // Course Popularity (modules per course)
    // We don't have a backend "popularity" metric; use number of modules as a proxy.
    const courseLabels = courses.map((c) => c.name);
    // Lazy: set to 0 initially; detail page can show modules.
    this.barChartData = {
      labels: courseLabels,
      datasets: [{ data: courses.map(() => 0), label: 'Modules per Course' }],
    };

    // Enrollment Trends (pie by courseId for selected student)
    const eBuckets = new Map<string, number>();
    for (const e of enrollments) {
      const key = `Course ${e.courseId}`;
      eBuckets.set(key, (eBuckets.get(key) ?? 0) + 1);
    }
    const eLabels = Array.from(eBuckets.keys());
    this.pieChartData = {
      labels: eLabels,
      datasets: [{ data: eLabels.map((l) => eBuckets.get(l) ?? 0) }],
    };
  }
}
