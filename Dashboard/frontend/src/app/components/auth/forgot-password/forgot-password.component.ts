import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const { email } = this.forgotPasswordForm.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response: any) => {
          this.emailSent = true;
          this.isLoading = false;
          // In production, don't show the token
          if (response.resetToken) {
            console.log('Reset token (dev only):', response.resetToken);
          }
          this.snackBar.open('Password reset link sent to your email', 'Close', { duration: 5000 });
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.error?.message || 'Error sending reset email', 'Close', { duration: 5000 });
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

