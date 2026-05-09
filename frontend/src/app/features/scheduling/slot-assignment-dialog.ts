import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ModuleResponseDTO, UserResponseDTO } from '../../core/services/api';

export interface SlotAssignmentDialogData {
  dayLabel: string;
  timeLabel: string;
  modules: ModuleResponseDTO[];
  trainers: UserResponseDTO[];
}

export interface SlotAssignmentDialogResult {
  moduleId: number;
  trainerId: number;
}

@Component({
  selector: 'app-slot-assignment-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Assign Slot</h2>
    <div mat-dialog-content>
      <div class="text-sm app-muted mb-3">{{ data.dayLabel }} | {{ data.timeLabel }}</div>
      <form [formGroup]="form" class="grid grid-cols-1 gap-3">
        <mat-form-field appearance="outline">
          <mat-label>Module</mat-label>
          <mat-select formControlName="moduleId">
            <mat-option *ngFor="let m of data.modules" [value]="m.id">{{ m.name }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Trainer</mat-label>
          <mat-select formControlName="trainerId">
            <mat-option *ngFor="let t of data.trainers" [value]="t.id">{{ t.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Assign</button>
    </div>
  `,
})
export class SlotAssignmentDialog {
  private readonly fb = inject(FormBuilder);
  readonly data = inject<SlotAssignmentDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SlotAssignmentDialog, SlotAssignmentDialogResult | null>);

  readonly form = this.fb.group({
    moduleId: [0, [Validators.required, Validators.min(1)]],
    trainerId: [0, [Validators.required, Validators.min(1)]],
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
      moduleId: Number(raw.moduleId),
      trainerId: Number(raw.trainerId),
    });
  }
}
