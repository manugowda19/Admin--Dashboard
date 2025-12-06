import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContentService } from '../../../services/content.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-content-form',
  templateUrl: './content-form.component.html',
  styleUrls: ['./content-form.component.scss']
})
export class ContentFormComponent implements OnInit {
  contentForm: FormGroup;
  isEditMode = false;
  types = ['post', 'page', 'announcement', 'document'];
  statuses = ['draft', 'published', 'archived'];

  constructor(
    private fb: FormBuilder,
    private contentService: ContentService,
    private dialogRef: MatDialogRef<ContentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {
    this.contentForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      type: ['post', [Validators.required]],
      status: ['draft', [Validators.required]],
      tags: ['']
    });

    if (data) {
      this.isEditMode = true;
      this.contentForm.patchValue({
        title: data.title,
        content: data.content,
        type: data.type,
        status: data.status,
        tags: data.tags?.join(', ') || ''
      });
    }
  }

  ngOnInit() {}

  onSubmit() {
    if (this.contentForm.valid) {
      const formValue = this.contentForm.value;
      const tags = formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];

      const payload = {
        ...formValue,
        tags
      };

      if (this.isEditMode) {
        this.contentService.updateContent(this.data._id, payload).subscribe({
          next: () => {
            this.snackBar.open('Content updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Error updating content', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.contentService.createContent(payload).subscribe({
          next: () => {
            this.snackBar.open('Content created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Error creating content', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

