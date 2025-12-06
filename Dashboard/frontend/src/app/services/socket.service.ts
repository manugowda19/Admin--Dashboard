import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private socketUrl = environment.socketUrl;

  constructor(private authService: AuthService) {
    this.initializeSocket();
  }

  private initializeSocket() {
    const token = this.authService.getToken();
    if (token) {
      this.socket = io(this.socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }
  }

  subscribeToAnalytics(): Observable<any> {
    if (this.socket) {
      this.socket.emit('subscribe:analytics');
    }

    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('analytics:update', (data) => {
          observer.next(data);
        });
      }
    });
  }

  unsubscribeFromAnalytics() {
    if (this.socket) {
      this.socket.emit('unsubscribe:analytics');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  reconnect() {
    this.disconnect();
    this.initializeSocket();
  }
}

