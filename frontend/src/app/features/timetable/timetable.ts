import { Component } from '@angular/core';
import { StudentDashboard } from '../student-dashboard/student-dashboard';

@Component({
  selector: 'app-timetable',
  imports: [StudentDashboard],
  templateUrl: './timetable.html',
  styleUrl: './timetable.css',
})
export class Timetable {

}
