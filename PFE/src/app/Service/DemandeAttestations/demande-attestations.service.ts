import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DemandeAttestations } from 'src/app/Models/DemandeAttestations';

@Injectable({
  providedIn: 'root'
})
export class DemandeAttestationsService {
  private baseUrl = 'http://localhost:8080/api/DemandeAttestations'; // Adjust the base URL according to your backend configuration

  constructor(private http: HttpClient) { }
  saveDemande(demandeAttestations: DemandeAttestations, authToken: string): Observable<DemandeAttestations> {
    // Set the HTTP headers with the authorization token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });

    // Include the headers in the HTTP request
    return this.http.post<DemandeAttestations>(`${this.baseUrl}/saveDemande`, demandeAttestations, { headers });
  }

  getAllDemandeAttestations(authToken: string): Observable<DemandeAttestations[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });

    return this.http.get<DemandeAttestations[]>(this.baseUrl, { headers });
  }

  approveDemande(id: number, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });
    return this.http.put(`${this.baseUrl}/${id}/approve`, {}, { headers });
  }
  
  refuseDemande(id: number, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });
    return this.http.put(`${this.baseUrl}/${id}/refuse`, {}, { headers });
  }
  
  deleteDemande(id: number, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });
    return this.http.delete(`${this.baseUrl}/${id}`, { headers });
  }
}
