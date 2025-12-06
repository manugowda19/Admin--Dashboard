import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ContentService } from '../../../services/content.service';
import { ContentFormComponent } from '../content-form/content-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-content-management',
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.scss']
})
export class ContentManagementComponent implements OnInit {
  displayedColumns: string[] = ['title', 'type', 'status', 'author', 'views', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchTerm = '';
  typeFilter = '';
  statusFilter = '';
  
  types = ['post', 'page', 'announcement', 'document'];
  statuses = ['draft', 'published', 'archived'];
  
  totalContent = 0;
  pageSize = 10;
  currentPage = 1;

  constructor(
    private contentService: ContentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadContent();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadContent() {
    this.contentService.getAllContent(this.currentPage, this.pageSize, this.searchTerm, this.typeFilter, this.statusFilter)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.contents;
          this.totalContent = response.pagination.total;
        },
        error: (error) => {
          this.snackBar.open('Error loading content', 'Close', { duration: 3000 });
        }
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadContent();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadContent();
  }

  openContentForm(content?: any) {
    const dialogRef = this.dialog.open(ContentFormComponent, {
      width: '600px',
      data: content || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadContent();
      }
    });
  }

  deleteContent(content: any) {
    if (confirm(`Are you sure you want to delete "${content.title}"?`)) {
      this.contentService.deleteContent(content._id).subscribe({
        next: () => {
          this.snackBar.open('Content deleted successfully', 'Close', { duration: 3000 });
          this.loadContent();
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Error deleting content', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadContent();
  }
}

