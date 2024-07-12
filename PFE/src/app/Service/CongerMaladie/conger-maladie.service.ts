import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CongerMaladieService {
  private baseUrl = '/api/Gestionnaire';
  private CongerMaladie = '/api/CongerMaladie';

  
  constructor(private http: HttpClient) { }

  getAllCongerMaladie(authToken: string): Observable<any> {
    // Construct headers with authorization token
    const headers = new HttpHeaders(
      { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
    );

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };

    return this.http.get(`${this.baseUrl}/conger-maladie`, requestOptions);
  }

  updateCongerMaladieStatus(congerMaladieId: number, newStatus: string, authToken: string): Observable<any> {
    // Construct headers with authorization token
    const headers = new HttpHeaders(
      { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
    );

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };

    // Send only the status string directly in the request body
    return this.http.put(`${this.baseUrl}/conger-maladie/${congerMaladieId}/status`, newStatus, requestOptions);
  }
  getByUserId(userId: number, authToken: string): Observable<any[]> {
    const headers = new HttpHeaders(
      { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
    );

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };

    return this.http.get<any[]>(`${this.CongerMaladie}/${userId}`, requestOptions);
  }


}
