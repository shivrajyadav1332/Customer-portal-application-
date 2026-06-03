import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="forgot-password-container">
      <div class="forgot-password-box">
        <div class="forgot-password-header">
          <h1>Reset Password</h1>
          <p>Smart Gate System - Customer Portal</p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="reset-form">
          <p class="reset-info">Enter your email address and we'll send you a link to reset your password.</p>

          <mat-form-field class="full-width">
            <mat-label>Email Address</mat-label>
            <input 
              matInput 
              formControlName="email" 
              placeholder="Enter your email address"
              type="email"
            />
            <mat-error *ngIf="resetForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="resetForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>

          <button 
            mat-raised-button 
            color="primary" 
            class="reset-button"
            [disabled]="resetForm.invalid || isLoading"
            type="submit"
          >
            <mat-spinner *ngIf="isLoading" diameter="20" class="button-spinner"></mat-spinner>
            <span *ngIf="!isLoading">Send Reset Link</span>
            <span *ngIf="isLoading">Sending...</span>
          </button>

          <div class="reset-footer">
            <a (click)="goBackToLogin()" class="back-to-login">Back to Login</a>
          </div>
        </form>

        <div class="reset-info-box">
          <p>Enterprise Smart Gate System - Customer Portal v1.0</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .forgot-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .forgot-password-box {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 420px;
    }

    .forgot-password-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .forgot-password-header h1 {
      margin: 0;
      font-size: 28px;
      color: #333;
      font-weight: 600;
    }

    .forgot-password-header p {
      margin: 8px 0 0;
      color: #999;
      font-size: 14px;
    }

    .reset-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .reset-info {
      color: #666;
      font-size: 14px;
      margin: 0 0 16px;
      text-align: center;
    }

    .full-width {
      width: 100%;
    }

    .reset-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 8px;
    }

    .button-spinner {
      margin-right: 8px;
    }

    .reset-footer {
      text-align: center;
      margin-top: 20px;
    }

    .back-to-login {
      color: #667eea;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .back-to-login:hover {
      text-decoration: underline;
    }

    .reset-info-box {
      text-align: center;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .reset-info-box p {
      margin: 0;
      color: #999;
      font-size: 12px;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private toastr = inject(ToastrService);
    private cdr = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);

    resetForm!: FormGroup;
    isLoading = false;

    ngOnInit(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        this.resetForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.resetForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.cdr.markForCheck();

        // Simulate API call
        setTimeout(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
            this.toastr.success('Password reset link sent to your email!', 'Success');

            this.ngZone.run(() => {
                this.router.navigate(['/login']);
            });
        }, 1500);
    }

    goBackToLogin(): void {
        this.router.navigate(['/login']);
    }
}
