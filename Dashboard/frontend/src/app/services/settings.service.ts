import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`);
  }

  updateSettings(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings`, data);
  }

  createApiKey(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings/api-keys`, { name });
  }

  deleteApiKey(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/settings/api-keys/${id}`);
  }

  updateEmailConfig(config: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings/email-config`, config);
  }
}

