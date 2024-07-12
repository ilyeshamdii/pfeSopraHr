import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import * as SockJs from 'sockjs-client';
import * as Stomp from 'stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private baseUrl = 'http://localhost:8080/api/badges';

  constructor(private http: HttpClient) {}
     // Open connection with the back-end socket
     public connect() {
      let socket = new SockJs(`http://localhost:8080/socket`);

      let stompClient = Stomp.over(socket);

      return stompClient;
  }

  getAllNotifications(authToken :string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };
    return this.http.get<any[]>(`http://localhost:8080/api/badges/GetAllnotifications`,requestOptions);
  }

  
  getAllNotificationsManager(authToken :string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };
    return this.http.get<any[]>(`http://localhost:8080/api/badges/GetAllnotificationsManager`,requestOptions);
  }
  deleteNotificationById(id: number, authToken: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });

    return this.http.delete<void>(`${this.baseUrl}/notifications/${id}`, { headers });
  }

  getNotificationsForUser(userId: number, authToken: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };

    return this.http.get<any[]>(`${this.baseUrl}/notifications/${userId}`, requestOptions);
  }
}
