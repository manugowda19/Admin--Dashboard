import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ReportHistory {
  _id: string;
  type: string;
  dateRange: string;
  generated: Date;
  metrics: string[];
  fileUrl?: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  reportForm: FormGroup;
  reportHistory: ReportHistory[] = [];
  isLoading = false;
  displayedColumns: string[] = ['type', 'dateRange', 'generated', 'metrics', 'actions'];

  metricsOptions = [
    { id: 'totalUsers', label: 'Total Users Count', checked: true },
    { id: 'revenue', label: 'Revenue/Transactions', checked: true },
    { id: 'cpuUsage', label: 'CPU Usage Percentage', checked: true },
    { id: 'activeSessions', label: 'Active Sessions Count', checked: true },
    { id: 'systemHealth', label: 'System Health Status', checked: true },
    { id: 'memoryUsage', label: 'Memory Usage Percentage', checked: true }
  ];

  dateRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  reportFormatOptions = [
    { value: 'csv', label: 'CSV (Comma Separated Values)' },
    { value: 'pdf', label: 'PDF (Portable Document Format)' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.reportForm = this.fb.group({
      format: ['csv', Validators.required],
      dateRange: ['7', Validators.required],
      startDate: [null],
      endDate: [null],
      metrics: this.fb.group({
        totalUsers: [true],
        revenue: [true],
        cpuUsage: [true],
        activeSessions: [true],
        systemHealth: [true],
        memoryUsage: [true]
      })
    });
  }

  ngOnInit() {
    this.loadReportHistory();
    
    // Watch date range changes to show/hide custom date inputs
    this.reportForm.get('dateRange')?.valueChanges.subscribe(value => {
      if (value === 'custom') {
        this.reportForm.get('startDate')?.setValidators([Validators.required]);
        this.reportForm.get('endDate')?.setValidators([Validators.required]);
      } else {
        this.reportForm.get('startDate')?.clearValidators();
        this.reportForm.get('endDate')?.clearValidators();
      }
      this.reportForm.get('startDate')?.updateValueAndValidity();
      this.reportForm.get('endDate')?.updateValueAndValidity();
    });

    // Sync metricsOptions with form values
    const metricsControl = this.reportForm.get('metrics') as FormGroup;
    this.metricsOptions.forEach(metric => {
      metric.checked = metricsControl.get(metric.id)?.value || false;
    });
  }

  loadReportHistory() {
    this.isLoading = true;
    this.http.get<{ reports: ReportHistory[] }>(`${environment.apiUrl}/reports/history`).subscribe({
      next: (response) => {
        this.reportHistory = response.reports || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading report history:', error);
        this.isLoading = false;
        // Use mock data if API fails
        this.reportHistory = this.getMockHistory();
      }
    });
  }

  getMockHistory(): ReportHistory[] {
    return [
      {
        _id: '1',
        type: 'CSV',
        dateRange: 'Last 7 Days',
        generated: new Date(Date.now() - 86400000),
        metrics: ['Total Users Count', 'Revenue/Transactions', 'Active Sessions Count']
      },
      {
        _id: '2',
        type: 'PDF',
        dateRange: 'Last 30 Days',
        generated: new Date(Date.now() - 172800000),
        metrics: ['Total Users Count', 'Revenue/Transactions', 'CPU Usage Percentage', 'System Health Status']
      }
    ];
  }

  toggleMetric(metricId: string) {
    const metricsControl = this.reportForm.get('metrics') as FormGroup;
    const currentValue = metricsControl.get(metricId)?.value;
    metricsControl.get(metricId)?.setValue(!currentValue);
    
    // Update the metricsOptions array
    const metric = this.metricsOptions.find(m => m.id === metricId);
    if (metric) {
      metric.checked = !currentValue;
    }
  }

  generateReport() {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const formValue = this.reportForm.value;
    const selectedMetrics = Object.keys(formValue.metrics)
      .filter(key => formValue.metrics[key])
      .map(key => this.metricsOptions.find(m => m.id === key)?.label || key);

    if (selectedMetrics.length === 0) {
      alert('Please select at least one metric to include in the report.');
      return;
    }

    this.isLoading = true;

    // Prepare request payload
    const payload: any = {
      format: formValue.format,
      metrics: selectedMetrics
    };

    if (formValue.dateRange === 'custom') {
      payload.startDate = formValue.startDate;
      payload.endDate = formValue.endDate;
    } else {
      payload.days = parseInt(formValue.dateRange);
    }

    this.http.post(`${environment.apiUrl}/reports/generate`, payload, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        const contentType = response.headers.get('content-type');
        const blob = response.body;
        
        if (blob) {
          const fileExtension = formValue.format === 'pdf' ? 'pdf' : 'csv';
          const fileName = `report_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Reload history after generating
          this.loadReportHistory();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        alert('Failed to generate report. Please try again.');
        this.isLoading = false;
      }
    });
  }

  downloadReport(report: ReportHistory) {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    } else {
      alert('Report file is no longer available.');
    }
  }

  deleteReport(reportId: string) {
    if (confirm('Are you sure you want to delete this report?')) {
      this.http.delete(`${environment.apiUrl}/reports/${reportId}`).subscribe({
        next: () => {
          this.loadReportHistory();
        },
        error: (error) => {
          console.error('Error deleting report:', error);
          alert('Failed to delete report.');
        }
      });
    }
  }

  getSelectedMetricsCount(): number {
    const metricsControl = this.reportForm.get('metrics') as FormGroup;
    return Object.keys(metricsControl.value).filter(key => metricsControl.value[key]).length;
  }
}

