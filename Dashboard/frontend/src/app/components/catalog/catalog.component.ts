import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuditService } from '../../services/audit.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  recentContacts: any[] = [];
  recentActivities: any[] = [];
  isLoading = false;

  constructor(
    private userService: UserService,
    private auditService: AuditService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Load Recent Contacts
    this.userService.getAllUsers(1, 20).subscribe({
      next: (response) => {
        this.recentContacts = response.users.map((u: any) => ({
          name: u.name,
          role: u.role,
          email: u.email,
          isActive: u.isActive,
          lastLogin: u.lastLogin
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoading = false;
      }
    });

    // Load Recent Activities
    this.auditService.getAuditLogs(1, 20).subscribe({
      next: (response) => {
        this.recentActivities = response.logs.map((log: any) => ({
          type: log.action === 'create' ? 'user' : 
                log.action === 'update' ? 'content' : 
                log.action === 'login' ? 'auth' : 'system',
          icon: log.action === 'create' ? 'person_add' :
                log.action === 'update' ? 'article' :
                log.action === 'login' ? 'login' : 'settings',
          text: `${log.action} ${log.resource}${log.user ? ' by ' + log.user.name : ''}`,
          time: this.getTimeAgo(new Date(log.createdAt))
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        // Use mock data if API fails
        this.loadMockActivities();
        this.isLoading = false;
      }
    });
  }

  loadMockActivities() {
    this.recentActivities = [
      {
        type: 'user',
        icon: 'person_add',
        text: 'New user registered: John Doe',
        time: '2 minutes ago'
      },
      {
        type: 'content',
        icon: 'article',
        text: 'Content "Welcome Post" was published',
        time: '15 minutes ago'
      },
      {
        type: 'system',
        icon: 'settings',
        text: 'System settings updated',
        time: '1 hour ago'
      },
      {
        type: 'auth',
        icon: 'login',
        text: 'User logged in: admin@example.com',
        time: '2 hours ago'
      }
    ];
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}

