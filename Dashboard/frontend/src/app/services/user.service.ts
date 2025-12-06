import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 1, limit: number = 10, search: string = '', role: string = '', status: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (status) params = params.set('status', status);

    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  exportUsers(format: string = 'csv', role: string = '', status: string = ''): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (role) params = params.set('role', role);
    if (status) params = params.set('status', status);

    return this.http.get(`${this.apiUrl}/users/export`, {
      params,
      responseType: 'blob'
    });
  }

  bulkUpdateUsers(userIds: string[], action: string, value?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/bulk`, { userIds, action, value });
  }

  getUserActivity(userId: string, page: number = 1, limit: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/users/${userId}/activity`, { params });
  }
}

