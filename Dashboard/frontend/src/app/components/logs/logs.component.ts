import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuditService } from '../../services/audit.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  displayedColumns: string[] = ['date', 'user', 'action', 'resource', 'ipAddress', 'details'];
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchTerm = '';
  resourceFilter = '';
  actionFilter = '';
  userIdFilter = '';
  
  resources = ['user', 'content', 'auth', 'settings', 'api-key', 'email-config'];
  actions = ['create', 'update', 'delete', 'login', 'logout', 'view', 'export'];
  
  totalLogs = 0;
  pageSize = 50;
  currentPage = 1;
  isLoading = false;

  constructor(
    private auditService: AuditService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadLogs() {
    this.isLoading = true;
    this.auditService.getAuditLogs(
      this.currentPage,
      this.pageSize,
      this.userIdFilter,
      this.resourceFilter,
      this.actionFilter
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.logs;
        this.totalLogs = response.pagination.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading logs', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadLogs();
  }

  clearFilters() {
    this.searchTerm = '';
    this.resourceFilter = '';
    this.actionFilter = '';
    this.userIdFilter = '';
    this.currentPage = 1;
    this.loadLogs();
  }

  exportLogs(format: string) {
    this.auditService.exportLogs(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.snackBar.open(`Logs exported as ${format.toUpperCase()}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Error exporting logs', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  getActionColor(action: string): string {
    const colors: any = {
      create: 'primary',
      update: 'accent',
      delete: 'warn',
      login: 'primary',
      logout: 'accent',
      view: 'primary',
      export: 'accent'
    };
    return colors[action] || 'primary';
  }

  viewDetails(log: any) {
    const details = JSON.stringify(log.details || {}, null, 2);
    alert(`Log Details:\n\n${details}`);
  }
}

