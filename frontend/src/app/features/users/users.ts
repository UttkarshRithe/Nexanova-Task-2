import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiService, Role, UserResponseDTO } from '../../core/services/api';
import { Navbar } from '../../shared/navbar/navbar';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { UserFormDialog } from './user-form-dialog';

@Component({
  selector: 'app-delete-confirm',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirm Delete</h2>
    <div mat-dialog-content>Are you sure you want to delete this user?</div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </div>
  `
})
export class DeleteConfirmDialog {}

@Component({
  selector: 'app-users',
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
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    Navbar,
    Sidebar,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  readonly loading = signal(false);
  readonly users = signal<UserResponseDTO[]>([]);
  readonly displayedColumns = ['id', 'name', 'email', 'role', 'createdAt', 'actions'];
  readonly roleFilter = signal<Role | 'ALL'>('ALL');

  constructor(
    private readonly api: ApiService,
    private readonly snack: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  onRoleChange(newRole: Role | 'ALL') {
    this.roleFilter.set(newRole);
    this.loadUsers();
  }

  openAddUserDialog() {
    const ref = this.dialog.open(UserFormDialog, { width: '560px' });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.loading.set(true);
      this.api.registerUser(payload).subscribe({
        next: () => {
          this.snack.open('User created successfully.', 'Close', { duration: 2500 });
          this.loadUsers();
        },
        error: () => {
          this.snack.open('Failed to create user.', 'Close', { duration: 4000 });
          this.loading.set(false);
        },
      });
    });
  }

  editUser(user: UserResponseDTO) {
    const ref = this.dialog.open(UserFormDialog, { width: '560px', data: user });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.loading.set(true);
      this.api.updateUser(user.id, payload).subscribe({
        next: () => {
          this.snack.open('User updated successfully.', 'Close', { duration: 2500 });
          this.loadUsers();
        },
        error: () => {
          this.snack.open('Failed to update user.', 'Close', { duration: 4000 });
          this.loading.set(false);
        },
      });
    });
  }

  deleteUser(user: UserResponseDTO) {
    const ref = this.dialog.open(DeleteConfirmDialog, { width: '400px' });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.loading.set(true);
      this.api.deleteUser(user.id).subscribe({
        next: () => {
          this.snack.open('User deleted successfully.', 'Close', { duration: 2500 });
          this.loadUsers();
        },
        error: () => {
          this.snack.open('Failed to delete user.', 'Close', { duration: 4000 });
          this.loading.set(false);
        },
      });
    });
  }

  private loadUsers() {
    this.loading.set(true);
    const filter = this.roleFilter() === 'ALL' ? undefined : (this.roleFilter() as string);
    this.api.getUsers(filter).subscribe({
      next: (data) => this.users.set(data),
      error: () => this.snack.open('Failed to load users.', 'Close', { duration: 4000 }),
      complete: () => this.loading.set(false),
    });
  }
}
