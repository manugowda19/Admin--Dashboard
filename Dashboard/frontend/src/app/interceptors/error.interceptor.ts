import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Don't intercept login/register errors - let components handle them
        if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
          return throwError(() => error);
        }

        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          switch (error.status) {
            case 401:
              // Only logout if not already on login page
              if (!this.router.url.includes('/login')) {
                this.authService.logout();
                this.router.navigate(['/login']);
                errorMessage = 'Session expired. Please login again.';
              } else {
                errorMessage = error.error?.message || 'Authentication failed';
              }
              break;
            case 403:
              errorMessage = 'You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'Resource not found.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            case 0:
              errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
              break;
            default:
              errorMessage = error.error?.message || errorMessage;
          }
        }

        // Only show snackbar for non-auth errors
        if (!request.url.includes('/auth/')) {
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }

        return throwError(() => error);
      })
    );
  }
}

