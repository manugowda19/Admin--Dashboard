import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['select', 'name', 'role', 'isActive', 'lastLogin', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  roles = ['superadmin', 'admin', 'moderator', 'viewer'];
  
  totalUsers = 0;
  pageSize = 10;
  currentPage = 1;
  selectedUsers: any[] = [];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.userService.getAllUsers(this.currentPage, this.pageSize, this.searchTerm, this.roleFilter, this.statusFilter)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.users;
          this.totalUsers = response.pagination.total;
        },
        error: (error) => {
          this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
        }
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters() {
    this.searchTerm = '';
    this.roleFilter = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  openUserForm(user?: any) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: user || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.userService.deleteUser(user._id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewUserActivity(user: any) {
    // TODO: Open activity dialog
    this.snackBar.open(`Viewing activity for ${user.name}`, 'Close', { duration: 2000 });
  }

  exportUsers(format: string) {
    this.userService.exportUsers(format, this.roleFilter, this.statusFilter).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.snackBar.open(`Users exported as ${format.toUpperCase()}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Error exporting users', 'Close', { duration: 3000 });
      }
    });
  }

  toggleSelection(user: any, event: any) {
    if (event.checked) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers = this.selectedUsers.filter(u => u._id !== user._id);
    }
  }

  isSelected(user: any): boolean {
    return this.selectedUsers.some(u => u._id === user._id);
  }

  toggleAllSelection(event: any) {
    if (event.checked) {
      this.selectedUsers = [...this.dataSource.data];
    } else {
      this.selectedUsers = [];
    }
  }

  isAllSelected(): boolean {
    return this.dataSource.data.length > 0 && this.selectedUsers.length === this.dataSource.data.length;
  }

  clearSelection() {
    this.selectedUsers = [];
  }

  bulkActivate() {
    const userIds = this.selectedUsers.map(u => u._id);
    this.userService.bulkUpdateUsers(userIds, 'activate').subscribe({
      next: () => {
        this.snackBar.open(`${userIds.length} users activated`, 'Close', { duration: 3000 });
        this.clearSelection();
        this.loadUsers();
      },
      error: (error) => {
        this.snackBar.open('Error updating users', 'Close', { duration: 3000 });
      }
    });
  }

  bulkDeactivate() {
    const userIds = this.selectedUsers.map(u => u._id);
    this.userService.bulkUpdateUsers(userIds, 'deactivate').subscribe({
      next: () => {
        this.snackBar.open(`${userIds.length} users deactivated`, 'Close', { duration: 3000 });
        this.clearSelection();
        this.loadUsers();
      },
      error: (error) => {
        this.snackBar.open('Error updating users', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }
}
