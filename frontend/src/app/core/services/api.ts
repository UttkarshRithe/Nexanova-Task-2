import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getUsers(role?: string) {
    let params = new HttpParams();
    if (role && role !== 'ALL') {
      params = params.set('role', role);
    }
    return this.http.get<UserResponseDTO[]>(`${environment.apiBaseUrl}/api/users`, { params });
  }

  updateUser(id: number, payload: UpdateUserRequest) {
    return this.http.put<UserResponseDTO>(`${environment.apiBaseUrl}/api/users/${id}`, payload);
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/users/${id}`);
  }

  registerUser(payload: CreateUserRequest) {
    return this.http.post<UserResponseDTO>(`${environment.apiBaseUrl}/api/users/register`, payload);
  }

  getCourses() {
    return this.http.get<CourseResponseDTO[]>(`${environment.apiBaseUrl}/api/courses`);
  }

  getModulesByCourse(courseId: number) {
    return this.http.get<ModuleResponseDTO[]>(`${environment.apiBaseUrl}/api/courses/${courseId}/modules`);
  }

  createCourse(payload: CreateCourseRequest) {
    return this.http.post<CourseResponseDTO>(`${environment.apiBaseUrl}/api/courses`, payload);
  }

  updateCourse(courseId: number, payload: CreateCourseRequest) {
    return this.http.put<CourseResponseDTO>(`${environment.apiBaseUrl}/api/courses/${courseId}`, payload);
  }

  deleteCourse(courseId: number) {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/courses/${courseId}`);
  }

  createSchedule(payload: CreateScheduleRequest) {
    return this.http.post<ScheduleResponseDTO>(`${environment.apiBaseUrl}/api/schedule`, payload);
  }

  getScheduleByCourse(courseId: number) {
    return this.http.get<ScheduleResponseDTO[]>(`${environment.apiBaseUrl}/api/schedule/course/${courseId}`);
  }

  getScheduleById(scheduleId: number) {
    return this.http.get<ScheduleResponseDTO>(`${environment.apiBaseUrl}/api/schedule/${scheduleId}`);
  }

  deleteSchedule(scheduleId: number) {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/schedule/${scheduleId}`);
  }

  createTimeslot(payload: CreateTimeslotRequest) {
    return this.http.post<TimeslotResponseDTO>(`${environment.apiBaseUrl}/api/schedule/timeslots`, payload);
  }

  getTimeslotsBySchedule(scheduleId: number) {
    return this.http.get<TimeslotResponseDTO[]>(`${environment.apiBaseUrl}/api/schedule/timeslots/${scheduleId}`);
  }

  getEnrollmentsByStudent(studentId: number) {
    return this.http.get<EnrollmentResponseDTO[]>(
      `${environment.apiBaseUrl}/api/enrollments/student/${studentId}`
    );
  }
  enrollStudent(payload: CreateEnrollmentRequest) {
    return this.http.post<EnrollmentResponseDTO>(`${environment.apiBaseUrl}/api/enrollments`, payload);
  }
}

export type Role = 'ADMIN' | 'TRAINER' | 'TRAINEE';

export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface CourseResponseDTO {
  id: number;
  name: string;
  description: string | null;
  duration?: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: Role;
}

export interface CreateCourseRequest {
  name: string;
  description: string;
  duration: string;
  modules?: CreateModuleInput[];
}

export interface CreateModuleInput {
  name: string;
  description: string;
}

export interface ModuleResponseDTO {
  id: number;
  name: string;
  description: string | null;
  courseId: number;
}

export interface ScheduleResponseDTO {
  id: number;
  courseId: number;
  weekStartDate: string;
}

export type WeekDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface TimeslotResponseDTO {
  id: number;
  scheduleId: number;
  dayOfWeek: WeekDay;
  startTime?: string;
  endTime?: string;
  moduleId?: number;
  trainerId?: number;
}

export interface CreateScheduleRequest {
  courseId: number;
  weekStartDate: string;
}

export interface CreateTimeslotRequest {
  scheduleId: number;
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
  moduleId: number;
  trainerId: number;
}

export interface EnrollmentResponseDTO {
  id: number;
  studentId: number;
  courseId: number;
  enrolledAt: string;
  scheduleId: number;  // ← ADD
}

export interface CreateEnrollmentRequest {
  studentId: number;
  courseId: number;
  scheduleId: number;  // ← ADD
}

export interface TimetableEntryDTO {
  day: WeekDay;
  startTime: string;
  endTime: string;
  courseName: string;
  moduleName?: string;
  trainerName?: string;
}
