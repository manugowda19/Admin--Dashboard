import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getActiveUsers(days: number = 7): Observable<any> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get(`${this.apiUrl}/analytics/active-users`, { params });
  }

  getDailySignups(days: number = 30): Observable<any> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get(`${this.apiUrl}/analytics/signups`, { params });
  }

  getTrafficMetrics(days: number = 7): Observable<any> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get(`${this.apiUrl}/analytics/traffic`, { params });
  }

  getSalesMetrics(days: number = 30): Observable<any> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get(`${this.apiUrl}/analytics/sales`, { params });
  }

  getKPIs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/kpis`);
  }
}

