import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllContent(page: number = 1, limit: number = 10, search: string = '', type: string = '', status: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) params = params.set('search', search);
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);

    return this.http.get(`${this.apiUrl}/content`, { params });
  }

  getContentById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/content/${id}`);
  }

  createContent(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/content`, data);
  }

  updateContent(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/content/${id}`, data);
  }

  deleteContent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/content/${id}`);
  }
}

