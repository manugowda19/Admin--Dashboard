import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAuditLogs(page: number = 1, limit: number = 50, userId: string = '', resource: string = '', action: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (userId) params = params.set('userId', userId);
    if (resource) params = params.set('resource', resource);
    if (action) params = params.set('action', action);

    return this.http.get(`${this.apiUrl}/audit`, { params });
  }

  exportLogs(format: string = 'csv'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/audit/export`, {
      params,
      responseType: 'blob'
    });
  }
}

