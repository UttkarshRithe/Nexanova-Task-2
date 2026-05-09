import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { inject } from '@angular/core';
import { CreateUserRequest, Role } from '../../core/services/api';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Update User' : 'Add User' }}</h2>
    <div mat-dialog-content>
      <form [formGroup]="form" class="grid grid-cols-1 gap-3 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="!isEdit">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="ADMIN">ADMIN</mat-option>
            <mat-option value="TRAINER">TRAINER</mat-option>
            <mat-option value="TRAINEE">TRAINEE</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">{{ isEdit ? 'Update' : 'Create' }}</button>
    </div>
  `,
})
export class UserFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialog, CreateUserRequest | null>);
  readonly _data = inject<any>(MAT_DIALOG_DATA, { optional: true });
  readonly isEdit = !!this._data;

  readonly form = this.fb.group({
    name: [this._data?.name ?? '', Validators.required],
    email: [this._data?.email ?? '', [Validators.required, Validators.email]],
    password: ['', this.isEdit ? [] : Validators.required],
    role: [(this._data?.role ?? 'TRAINEE') as Role, Validators.required],
  });

  close() {
    this.dialogRef.close(null);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      name: raw.name ?? '',
      email: raw.email ?? '',
      ...(!this.isEdit && { password: raw.password ?? '' }),
      role: (raw.role ?? 'TRAINEE') as Role,
    });
  }
}
