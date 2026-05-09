import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CourseResponseDTO, CreateCourseRequest } from '../../core/services/api';

@Component({
  selector: 'app-course-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Course' : 'Add Course' }}</h2>
    <div mat-dialog-content>
      <form [formGroup]="form" class="grid grid-cols-1 gap-3 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" formControlName="description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Duration</mat-label>
          <input matInput placeholder="e.g., 8 weeks" formControlName="duration" />
        </mat-form-field>

        <div *ngIf="!data">
          <div class="font-medium mb-2">Modules</div>
          <div formArrayName="modules" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded" *ngFor="let moduleGroup of modules.controls; let i = index" [formGroupName]="i">
              <mat-form-field appearance="outline">
                <mat-label>Module Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>
              <div class="md:col-span-2">
                <button mat-stroked-button color="warn" type="button" (click)="removeModule(i)" [disabled]="modules.length === 1">
                  Remove Module
                </button>
              </div>
            </div>
          </div>
          <button mat-stroked-button type="button" (click)="addModule()">+ Add Module</button>
        </div>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">{{ data ? 'Update' : 'Create' }}</button>
    </div>
  `,
})
export class CourseFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CourseFormDialog, CreateCourseRequest | null>);
  readonly data = inject<CourseResponseDTO | null>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    description: [this.data?.description ?? '', Validators.required],
    duration: [this.data?.duration ?? '', Validators.required],
    modules: this.fb.array([]),
  });

  get modules(): FormArray {
    return this.form.get('modules') as FormArray;
  }

  constructor() {
    if (!this.data) {
      this.addModule();
    }
  }

  addModule() {
    this.modules.push(
      this.fb.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
      })
    );
  }

  removeModule(index: number) {
    if (this.modules.length === 1) return;
    this.modules.removeAt(index);
  }

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
      description: raw.description ?? '',
      duration: raw.duration ?? '',
      modules: !this.data
        ? (raw.modules ?? [])
            .filter((m: any) => !!m?.name && String(m.name).trim() !== '')
            .map((m: any) => ({
              name: String(m?.name ?? '').trim(),
              description: String(m?.description ?? '').trim(),
            }))
        : undefined,
    });
  }
}
