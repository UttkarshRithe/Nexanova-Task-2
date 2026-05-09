import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})
export class Navbar {
  readonly role = computed(() => this.auth.getRole());
  readonly email = computed(() => this.auth.getEmail());

  constructor(private readonly auth: AuthService, private readonly snack: MatSnackBar) {
    this.applyThemeFromStorage();
  }

  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('tms_theme', isDark ? 'dark' : 'light');
    this.snack.open(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'Close', { duration: 1200 });
  }

  logout() {
    this.auth.logout();
  }

  private applyThemeFromStorage() {
    const pref = localStorage.getItem('tms_theme');
    if (pref === 'dark') document.documentElement.classList.add('dark');
    if (pref === 'light') document.documentElement.classList.remove('dark');
  }
}
