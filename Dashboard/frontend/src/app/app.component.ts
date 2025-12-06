import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Admin Dashboard';
  isAuthenticated = false;
  currentUser: any = null;
  notificationCount = 3;
  notifications = [
    { title: 'New user registered', time: '2 minutes ago' },
    { title: 'System backup completed', time: '1 hour ago' },
    { title: 'Report generated successfully', time: '3 hours ago' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
    });

    // Check initial authentication state
    if (!this.authService.isAuthenticated()) {
      const currentUrl = this.router.url;
      if (currentUrl !== '/login' && currentUrl !== '/') {
        this.router.navigate(['/login']);
      }
    } else {
      // Load current user if token exists
      this.authService.getMe().subscribe({
        next: (response) => {
          // User will be set via currentUser$ subscription
        },
        error: () => {
          // Token invalid, will be handled by error interceptor
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserRoleDisplay(role: string): string {
    const roleMap: any = {
      'superadmin': 'VP Fancy Admin',
      'admin': 'Admin',
      'moderator': 'Moderator',
      'viewer': 'Viewer'
    };
    return roleMap[role] || role;
  }
}

