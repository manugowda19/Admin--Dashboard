import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AnalyticsService } from '../../services/analytics.service';
import { UserService } from '../../services/user.service';
import { SocketService } from '../../services/socket.service';
import { SearchDialogComponent } from './search-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { mockGeographyData } from '../../data/mockGeoData';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('worldMap', { static: false }) worldMapRef!: ElementRef;
  
  private destroy$ = new Subject<void>();
  
  kpis: any = {};
  activeUsersData: any = {};
  salesData: any = {};
  signupsData: any = {};
  activityData: any = {};
  dealsData: any = {};
  dealsLegend: any[] = [];
  geographyData: any[] = [];
  mapData: any = null;
  isLoading = true;

  // Mock data for widgets
  todayEvents: any[] = [
    { time: '8:00 PM', title: 'Team Meeting', duration: '1h 15m', type: 'meeting' },
    { time: '9:30 PM', title: 'Client Call', duration: '45m', type: 'call' },
    { time: '10:30 PM', title: 'Project Review', duration: '1h', type: 'review' }
  ];

  emailStats = {
    sent: 150,
    opened: 135,
    openRate: 90
  };

  notifications: any[] = [];
  searchQuery: string = '';
  mockTransactions = [
    { txId: "01e4dsa", user: "johndoe", date: "2021-09-01", cost: "43.95" },
    { txId: "03e4dsa", user: "jackdower", date: "2022-04-01", cost: "133.45" },
    { txId: "04e4dsa", user: "aberdohnny", date: "2021-09-01", cost: "43.95" },
    { txId: "05e4dsa", user: "goodmanave", date: "2022-11-05", cost: "200.00" },
    { txId: "06e4dsa", user: "stevebower", date: "2022-11-02", cost: "13.55" },
    { txId: "07e4dsa", user: "aberdohnny", date: "2021-09-01", cost: "43.95" },
    { txId: "08e4dsa", user: "wootzifer", date: "2019-04-15", cost: "24.99" },
    { txId: "09e4dsa", user: "jackdower", date: "2022-04-01", cost: "133.45" },
  ];

  // Chart options
  lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  areaChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        fill: true
      }
    }
  };

  pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  doughnutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  constructor(
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private socketService: SocketService,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
    this.subscribeToRealtimeUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.unsubscribeFromAnalytics();
  }

  loadData() {
    // Load KPIs
    this.analyticsService.getKPIs().subscribe({
      next: (data) => {
        this.kpis = data;
        this.kpis.newSignups = Math.floor(Math.random() * 20) + 5; // Mock data
      },
      error: (error) => console.error('Error loading KPIs:', error)
    });

    // Load Active Users
    this.analyticsService.getActiveUsers(7).subscribe({
      next: (data) => {
        this.activeUsersData = {
          labels: data.analytics.map((a: any) => new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Active Users',
            data: data.analytics.map((a: any) => a.activeUsers),
            borderColor: '#3F51B5',
            backgroundColor: 'rgba(63, 81, 181, 0.1)',
            tension: 0.4,
            fill: true
          }]
        };
      },
      error: (error) => console.error('Error loading active users:', error)
    });

    // Load Sales
    this.analyticsService.getSalesMetrics(30).subscribe({
      next: (data) => {
        this.salesData = {
          labels: data.analytics.map((a: any) => new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Revenue',
            data: data.analytics.map((a: any) => a.revenue),
            backgroundColor: '#E91E63'
          }]
        };
      },
      error: (error) => console.error('Error loading sales:', error)
    });

    // Load Signups
    this.analyticsService.getDailySignups(30).subscribe({
      next: (data) => {
        const signups = data.signups || [];
        this.signupsData = {
          labels: signups.map((s: any) => s._id),
          datasets: [{
            data: signups.map((s: any) => s.count),
            backgroundColor: [
              '#3F51B5',
              '#E91E63',
              '#4CAF50',
              '#FF9800',
              '#9C27B0',
              '#00BCD4',
              '#FFC107'
            ]
          }]
        };
      },
      error: (error) => console.error('Error loading signups:', error)
    });

    // Load Activity Data (mock)
    this.loadActivityData();

    // Load Deals Data (mock)
    this.loadDealsData();

    // Load Geography Data (same as Geography page)
    this.loadGeographyData();
    this.loadWorldMap();

    // Load Notifications (mock)
    this.loadNotifications();
  }

  ngAfterViewInit() {
    if (this.mapData && this.worldMapRef) {
      setTimeout(() => this.renderMap(), 300);
    }
  }

  loadNotifications() {
    // Mock notifications - in production, fetch from backend
    this.notifications = [
      {
        type: 'success',
        icon: 'check_circle',
        title: 'System Update',
        message: 'Database backup completed successfully',
        time: '5 minutes ago'
      },
      {
        type: 'warning',
        icon: 'warning',
        title: 'High Traffic',
        message: 'Unusual traffic spike detected',
        time: '1 hour ago'
      },
      {
        type: 'info',
        icon: 'info',
        title: 'New User',
        message: 'A new user has registered',
        time: '2 hours ago'
      }
    ];
  }


  loadActivityData() {
    // Mock activity data
    const dates = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    this.activityData = {
      labels: dates,
      datasets: [
        {
          label: 'User Activity',
          data: Array.from({ length: 14 }, () => Math.floor(Math.random() * 100) + 50),
          borderColor: '#3F51B5',
          backgroundColor: 'rgba(63, 81, 181, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Content Views',
          data: Array.from({ length: 14 }, () => Math.floor(Math.random() * 80) + 30),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  loadDealsData() {
    // Mock deals data
    this.dealsData = {
      labels: ['New', 'Prospect', 'Proposal', 'Won', 'Lost'],
      datasets: [{
        data: [73, 8, 6, 7, 7],
        backgroundColor: [
          '#9C27B0',
          '#2196F3',
          '#FFC107',
          '#4CAF50',
          '#F44336'
        ]
      }]
    };

    this.dealsLegend = [
      { label: 'New', value: 73, color: '#9C27B0' },
      { label: 'Prospect', value: 8, color: '#2196F3' },
      { label: 'Proposal', value: 6, color: '#FFC107' },
      { label: 'Won', value: 7, color: '#4CAF50' },
      { label: 'Lost', value: 7, color: '#F44336' }
    ];
  }

  subscribeToRealtimeUpdates() {
    this.socketService.subscribeToAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data.activeUsers !== undefined) {
          this.kpis.activeUsers = data.activeUsers;
        }
        if (data.revenue !== undefined) {
          this.kpis.revenue = data.revenue;
        }
        if (data.transactions !== undefined) {
          this.kpis.transactions = data.transactions;
        }
        if (data.pageViews !== undefined) {
          this.kpis.pageViews = data.pageViews;
        }
      });
  }

  openSearch() {
    const dialogRef = this.dialog.open(SearchDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Search result selected:', result);
        // Handle navigation based on result type
        if (result.type === 'user') {
          // Navigate to user details or user management
          console.log('Navigate to user:', result.data);
        } else if (result.type === 'content') {
          // Navigate to content details
          console.log('Navigate to content:', result.data);
        }
      }
    });
  }

  loadGeographyData() {
    // Use same data as Geography page
    this.geographyData = mockGeographyData;
  }

  async loadWorldMap() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
      if (!response.ok) {
        throw new Error('Failed to load map data');
      }
      this.mapData = await response.json();
      
      setTimeout(() => {
        if (this.worldMapRef) {
          this.renderMap();
        }
      }, 200);
    } catch (error) {
      console.error('Error loading world map:', error);
    }
  }

  renderMap() {
    if (!this.worldMapRef || !this.mapData) {
      return;
    }

    const svg = d3.select(this.worldMapRef.nativeElement);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 200;
    const projection = d3Geo.geoMercator()
      .scale(80)
      .translate([width / 2, height / 2]);

    const path = d3Geo.geoPath().projection(projection);

    const g = svg.append('g').attr('class', 'countries');

    g.selectAll('path')
      .data(this.mapData.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', (d: any) => {
        const iso = d.properties?.ISO_A2 || d.properties?.ISO_A3 || d.properties?.ADM0_A3 || d.id;
        return this.getCountryColor(iso);
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.3)
      .attr('class', 'country-path')
      .on('mouseover', (event: any, d: any) => {
        d3.select(event.currentTarget)
          .attr('stroke-width', 1)
          .attr('stroke', '#1976d2')
          .attr('opacity', 0.8);
      })
      .on('mouseout', (event: any, d: any) => {
        d3.select(event.currentTarget)
          .attr('stroke-width', 0.3)
          .attr('stroke', '#ffffff')
          .attr('opacity', 1);
      })
      .append('title')
      .text((d: any) => {
        const iso = d.properties?.ISO_A2 || d.properties?.ISO_A3 || d.properties?.ADM0_A3 || d.id;
        const name = d.properties?.NAME || d.properties?.name || d.properties?.ADMIN || 'Unknown';
        const value = this.getCountryValue(iso);
        return `${name}: ${value.toLocaleString()}`;
      });
  }

  getCountryValue(countryId: string): number {
    const country = this.geographyData.find((d: any) => d.id === countryId);
    return country ? country.value : 0;
  }

  getCountryColor(countryId: string): string {
    const value = this.getCountryValue(countryId);
    if (value === 0) return '#e0e0e0';
    if (value < 200000) return '#c8e6c9';
    if (value < 400000) return '#81c784';
    if (value < 600000) return '#4caf50';
    if (value < 800000) return '#388e3c';
    if (value < 1000000) return '#2e7d32';
    return '#1b5e20';
  }

  downloadReport() {
    // Navigate to reports page or trigger report generation
    this.router.navigate(['/reports']);
  }
}
