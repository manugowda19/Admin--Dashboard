import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  roles = ['superadmin', 'admin', 'moderator', 'viewer'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private http: HttpClient,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['viewer', [Validators.required]],
      isActive: [true]
    });

    if (data) {
      this.isEditMode = true;
      this.userForm.patchValue({
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive
      });
      this.userForm.get('email')?.disable();
    }
  }

  ngOnInit() {}

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      
      if (this.isEditMode) {
        this.userService.updateUser(this.data._id, formValue).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error: any) => {
            this.snackBar.open(error.error?.message || 'Error updating user', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Register new user (requires password)
        const { name, email, role } = formValue;
        this.http.post(`${environment.apiUrl}/auth/register`, {
          name,
          email,
          password: 'password123', // Default password, should be changed
          role
        }).subscribe({
          next: () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error: any) => {
            this.snackBar.open(error.error?.message || 'Error creating user', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

