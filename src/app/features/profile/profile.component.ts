import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileService, UserProfile, ActivityLog } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { UserInfo } from '../../core/models/auth.model';

@Component({
  selector: 'app-profile',
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
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  profile: UserProfile | null = null;
  currentUser: UserInfo | null = null;
  activityLogs: ActivityLog[] = [];
  isLoading = true;
  isSaving = false;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  pageNumber = 1;
  pageSize = 10;
  totalLogs = 0;

  displayedColumns = ['action', 'description', 'timestamp', 'ipAddress'];

  ngOnInit(): void {
    this.initializeForms();
    this.loadCurrentUser();
    this.loadProfile();
    this.loadActivityLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading current user:', err);
        }
      });
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.profile = data;
          this.profileForm.patchValue(data);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadActivityLogs(): void {
    this.profileService.getActivityLogs(this.pageNumber, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.activityLogs = data.data;
          this.totalLogs = data.total;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error loading activity logs:', err)
      });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      this.profileService.updateProfile(this.profileForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.profile = data;
            this.isSaving = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error updating profile:', err);
            this.isSaving = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isSaving = true;
      const { oldPassword, newPassword } = this.passwordForm.value;
      this.profileService.changePassword(oldPassword, newPassword)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isSaving = false;
            this.passwordForm.reset();
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error changing password:', err);
            this.isSaving = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  exportData(): void {
    this.profileService.exportProfileData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'profile-data.json';
        link.click();
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadActivityLogs();
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('newPassword');
    const confirm = group.get('confirmPassword');

    if (password && confirm && password.value !== confirm.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
