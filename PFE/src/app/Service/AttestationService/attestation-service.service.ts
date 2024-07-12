import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadResponse } from 'src/app/Models/UploadResponse';

@Injectable({
  providedIn: 'root'
})
export class AttestationServiceService {
  private baseUrl = 'http://localhost:8080/api/Gestionnaire'; // Adjust the base URL according to your backend configuration
  pdfContent: string = ''; // New property to store PDF content

  constructor(private http: HttpClient) { }

  saveAttestation(file: File | null, name: string, isExist: boolean, authToken: string): Observable<string> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('name', name);
    formData.append('isExist', isExist ? 'true' : 'false');

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${authToken}` });

    return this.http.post<string>(`${this.baseUrl}/SaveAttestations`, formData, { headers: headers, responseType: 'text' as 'json' });
  }

  generatePdf(pdfContent: string, pdfName: string, authToken: string): Observable<string> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${authToken}` });

    return this.http.post<string>(
      `${this.baseUrl}/GeneratePdf`, 
      { pdfContent, pdfName }, 
      { headers: headers, responseType: 'text' as 'json' }
    );
  }

  getAllAttestations(authToken: string): Observable<any[]> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${authToken}` });

    return this.http.get<any[]>(`${this.baseUrl}/attestations`, { headers: headers });
  }
  getPdf(fileName: string, authToken: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders({ 
        'Content-Type': 'application/pdf',
        'Authorization': `Bearer ${authToken}` 
    });
    return this.http.get(`${this.baseUrl}/pdfs/${fileName}`, {
        responseType: 'blob',
        observe: 'response',
        headers: headers
    });
}


pdfsUser(fileName: string, authToken: string, userId: string, username: string, email: string): Observable<HttpResponse<Blob>> {
  const headers = new HttpHeaders({ 
      'Content-Type': 'application/pdf',
      'Authorization': `Bearer ${authToken}` 
  });
  const params = { userId, username, email };
  return this.http.get(`${this.baseUrl}/pdfsUser/${fileName}`, {
      params,
      responseType: 'blob',
      observe: 'response',
      headers: headers
  });
}


deleteAttestation(attestationId: number, authToken: string): Observable<string> {
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${authToken}` });

  return this.http.delete<string>(`${this.baseUrl}/attestations/${attestationId}`, { headers, responseType: 'text' as 'json' });
}

updateAttestation(file: File | null, name: string, id:string , isExist: boolean, authToken: string): Observable<string> {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  formData.append('name', name);
  formData.append('id', id);

  formData.append('isExist', isExist ? 'true' : 'false');

  const headers = new HttpHeaders({ 'Authorization': `Bearer ${authToken}` });

  return this.http.post<string>(`${this.baseUrl}/UpdateAttestation`, formData, { headers: headers, responseType: 'text' as 'json' });
}
}
