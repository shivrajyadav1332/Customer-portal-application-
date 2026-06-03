import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  appSettingsForm!: FormGroup;
  notificationSettingsForm!: FormGroup;
  securitySettingsForm!: FormGroup;
  apiSettingsForm!: FormGroup;

  isLoading = true;
  isSaving = false;
  systemInfo: any = null;

  ngOnInit(): void {
    this.initializeForms();
    this.loadSettings();
    this.loadSystemInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForms(): void {
    this.appSettingsForm = this.fb.group({
      companyName: ['', Validators.required],
      theme: ['light', Validators.required],
      language: ['en', Validators.required],
      timezone: ['UTC', Validators.required],
      dateFormat: ['MM/DD/YYYY', Validators.required],
      timeFormat: ['12h', Validators.required],
      currency: ['USD', Validators.required],
      sessionTimeout: [30, Validators.required]
    });

    this.notificationSettingsForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [true],
      smsNotifications: [false],
      notificationFrequency: ['instant', Validators.required],
      quietHoursStart: ['22:00'],
      quietHoursEnd: ['08:00']
    });

    this.securitySettingsForm = this.fb.group({
      passwordMinLength: [8, Validators.required],
      requireUpperCase: [true],
      requireNumbers: [true],
      requireSpecialChar: [true],
      passwordExpiryDays: [90, Validators.required],
      maxLoginAttempts: [5, Validators.required],
      enable2FA: [true]
    });

    this.apiSettingsForm = this.fb.group({
      apiKey: ['', Validators.required],
      rateLimitPerMinute: [1000, Validators.required],
      enableWebhooks: [true],
      webhookUrl: ['', Validators.required]
    });
  }

  loadSettings(): void {
    this.isLoading = true;
    this.settingsService.getApplicationSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.appSettingsForm.patchValue(data);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading settings:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadSystemInfo(): void {
    this.settingsService.getSystemInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.systemInfo = data;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error loading system info:', err)
      });
  }

  saveApplicationSettings(): void {
    if (this.appSettingsForm.valid) {
      this.isSaving = true;
      this.settingsService.updateApplicationSettings(this.appSettingsForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error saving settings:', err);
            this.isSaving = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  saveNotificationSettings(): void {
    if (this.notificationSettingsForm.valid) {
      this.isSaving = true;
      this.settingsService.updateNotificationSettings(this.notificationSettingsForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error saving notification settings:', err);
            this.isSaving = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  saveSecuritySettings(): void {
    if (this.securitySettingsForm.valid) {
      this.isSaving = true;
      this.settingsService.updateSecuritySettings(this.securitySettingsForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error saving security settings:', err);
            this.isSaving = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  saveAPISettings(): void {
    if (this.apiSettingsForm.valid) {
      this.isSaving = true;
      this.settingsService.updateAPISettings(this.apiSettingsForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error saving API settings:', err);
            this.isSaving = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  generateNewAPIKey(): void {
    this.settingsService.generateNewAPIKey()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.apiSettingsForm.patchValue({ apiKey: response.apiKey });
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error generating API key:', err)
      });
  }

  exportSettings(): void {
    this.settingsService.exportSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'settings-backup.json';
        link.click();
      });
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      this.settingsService.resetToDefaults()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSettings();
            this.cdr.markForCheck();
          },
          error: (err) => console.error('Error resetting settings:', err)
        });
    }
  }
}
