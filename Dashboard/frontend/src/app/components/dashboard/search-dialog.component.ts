import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-search-dialog',
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss']
})
export class SearchDialogComponent {
  searchQuery: string = '';
  searchResults: any = {
    users: [],
    content: [],
    total: 0
  };
  isLoading = false;
  selectedCategory: string = 'all';

  constructor(
    public dialogRef: MatDialogRef<SearchDialogComponent>,
    private userService: UserService,
    private contentService: ContentService
  ) {}

  onSearch() {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.isLoading = true;
    this.searchResults = { users: [], content: [], total: 0 };

    // Search users
    if (this.selectedCategory === 'all' || this.selectedCategory === 'users') {
      this.userService.getAllUsers(1, 10, this.searchQuery).subscribe({
        next: (response) => {
          this.searchResults.users = response.users || [];
          this.searchResults.total += this.searchResults.users.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.isLoading = false;
        }
      });
    }

    // Search content
    if (this.selectedCategory === 'all' || this.selectedCategory === 'content') {
      this.contentService.getAllContent(1, 10, this.searchQuery).subscribe({
        next: (response) => {
          this.searchResults.content = response.content || [];
          this.searchResults.total += this.searchResults.content.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching content:', error);
          this.isLoading = false;
        }
      });
    }

    if (this.selectedCategory === 'all') {
      // Wait a bit for both requests
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }

  close() {
    this.dialogRef.close();
  }

  selectUser(user: any) {
    this.dialogRef.close({ type: 'user', data: user });
  }

  selectContent(content: any) {
    this.dialogRef.close({ type: 'content', data: content });
  }
}

