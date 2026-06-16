import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { SignupRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  signupForm!: FormGroup;
  isLoading = false;

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: [''],
      lastName: ['']
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();
    const details: SignupRequest = this.signupForm.value;

    this.authService.signup(details).subscribe({
      next: () => {
        this.toastr.success('Account created successfully!', 'Success');
        this.isLoading = false;
        this.cdr.markForCheck();
        this.ngZone.run(() => this.router.navigate(['/dashboard']));
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          const errorMessage = error.error?.message || error.message || 'Signup failed';
          this.toastr.error(errorMessage, 'Error');
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
