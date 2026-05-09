import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { Login } from './features/auth/login/login';
import { AdminDashboard } from './features/admin-dashboard/admin-dashboard';
import { StudentDashboard } from './features/student-dashboard/student-dashboard';
import { Users } from './features/users/users';
import { Courses } from './features/courses/courses';
import { Scheduling } from './features/scheduling/scheduling';
import { Enrollments } from './features/enrollments/enrollments';
import { Timetable } from './features/timetable/timetable';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },

  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'student-dashboard',
    component: StudentDashboard,
    canActivate: [authGuard],
    data: { roles: ['TRAINEE'] },
  },

  // Admin navigation pages (UI + data views)
  { path: 'admin/users', component: Users, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/courses', component: Courses, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/scheduling', component: Scheduling, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/enrollments', component: Enrollments, canActivate: [authGuard], data: { roles: ['ADMIN'] } },

  // Student-only timetable page (separate from dashboard if needed)
  { path: 'timetable', component: Timetable, canActivate: [authGuard], data: { roles: ['TRAINEE'] } },

  { path: '**', redirectTo: 'login' },
];
