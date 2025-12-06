import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loader for specific endpoints if needed
    if (request.url.includes('/auth/refresh-token')) {
      return next.handle(request);
    }

    this.activeRequests++;
    // You can implement a global loader service here if needed

    return next.handle(request).pipe(
      finalize(() => {
        this.activeRequests--;
      })
    );
  }
}

