import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CollaboratorService {
  private apiUrl = 'http://localhost:8080/api/Gestionnaire';

  constructor(private http: HttpClient) { }

  getCollaboratorName(collaboratorId: string): Observable<string> {
    let headers = new HttpHeaders();
    const authToken = localStorage.getItem('authToken'); // Assuming the token is stored in localStorage
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }

    return this.http.get(`${this.apiUrl}/${collaboratorId}/name`, { headers, responseType: 'text' }).pipe(
      map(response => {
        try {
          const parsedResponse = JSON.parse(response);
          return parsedResponse.name;
        } catch (e) {
          // If the response is not valid JSON, return the plain text response
          return response;
        }
      }),
      catchError((error) => {
        console.error('Error fetching collaborator name:', error);
        return throwError(error);
      })
    );
  }
}
