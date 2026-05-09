import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  readonly loading = signal(false);
  hidePassword = true;
  form!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as { email: string; password: string };
    if (!payload?.email || !payload?.password) return;

    this.loading.set(true);
    this.auth.login(payload).subscribe({
      next: (res) => {
        const token = res as string;
        if (!token || typeof token !== 'string') {
          this.snack.open('Invalid login response from server.', 'Close', { duration: 4000 });
          this.loading.set(false);
          return;
        }

        this.auth.setToken(token);

        const role = this.auth.getRole();
        if (role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'TRAINEE') {
          this.router.navigate(['/student-dashboard']);
        } else {
          this.snack.open('Unsupported role for this portal.', 'Close', { duration: 4000 });
          this.auth.logout();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.snack.open('Login failed. Please check your email/password.', 'Close', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }
}
