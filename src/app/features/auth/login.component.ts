import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  ngOnInit(): void {
    this.initializeForm();
    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();
    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        // Store token and user info
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('refreshToken', response.refreshToken || '');
          localStorage.setItem('tokenExpiry', (Date.now() + (response.expiresIn * 1000)).toString());
        }

        if (response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }

        this.toastr.success('Login successful!', 'Success');
        this.isLoading = false;
        this.cdr.markForCheck();

        const redirectUrl = sessionStorage.getItem('redirectUrl');
        sessionStorage.removeItem('redirectUrl');

        this.ngZone.run(() => {
          this.router.navigate([redirectUrl || '/dashboard']);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
          const errorMessage = error.error?.message || error.message || 'Login failed';
          this.toastr.error(errorMessage, 'Error');
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
