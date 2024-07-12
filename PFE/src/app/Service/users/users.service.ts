import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/Models/User';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = 'http://localhost:8080/api/Gestionnaire/users';
  private baseUrl2 = 'http://localhost:8080/api/auth/';


  private authToken!: string; // Add authToken property

  constructor(private http : HttpClient) {}

  updatePassword(userId: number, currentPassword: string, newPassword: string, authToken: string): Observable<any> {
    const headers = { 'Authorization': `Bearer ${authToken}` };
    const body = { currentPassword, newPassword };
    return this.http.put(`${this.baseUrl2}updatePassword/${userId}`, body, { headers });
  }
  // Method to update user profile
  updateUserProfile(userId: number, formData: FormData, authToken: string): Observable<any> {
    const headers = { 'Authorization': `Bearer ${authToken}` };
    return this.http.put(`${this.baseUrl2}update/${userId}`, formData, { headers });
  }

  getAllUsers(authToken : string): Observable<User[]> {
    // Create headers with authorization token
    const headers = new HttpHeaders(
      {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
  );

    // Include headers in the request options
    const requestOptions = {
      headers: headers
  };
    // Make GET request with options
    return this.http.get<User[]>(this.baseUrl, requestOptions);
  }
  updateStatus(userId: number, newStatus: boolean, authToken: string): Observable<any> {
    // Create headers with authorization token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };

    // Make PUT request with options
    return this.http.put<any>(`${this.baseUrl}/${userId}/status?newStatus=${newStatus}`, {}, requestOptions);
  }
}
