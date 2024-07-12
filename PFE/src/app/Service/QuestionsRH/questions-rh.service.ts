import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Assuming you have environment configurations
import { QuestionsRH } from 'src/app/Models/QuestionsRH';

@Injectable({
  providedIn: 'root'
})
export class QuestionsRHService {

  private apiUrl = 'http://localhost:8080/api'; // Replace with your API base URL

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const authToken = localStorage.getItem('authToken'); // Retrieve token from localStorage
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    return headers;
  }

  getAllQuestionsRH(): Observable<QuestionsRH[]> {
    return this.http.get<QuestionsRH[]>(`${this.apiUrl}/QuestionsRH/`, { headers: this.getHeaders() });
  }

  getQuestionsRHById(userId: number): Observable<QuestionsRH[]> {
    return this.http.get<QuestionsRH[]>(`${this.apiUrl}/QuestionsRH/${userId}`, { headers: this.getHeaders() });
  }
  getQuestionsRHByUserId(userId: number): Observable<QuestionsRH[]> {
    return this.http.get<QuestionsRH[]>(`${this.apiUrl}/QuestionsRH/user/${userId}`, { headers: this.getHeaders() });
  }
  
  createQuestionsRH(categories: string, sousCategories: string, titre: string, descriptions: string, piecesJoint: File | null, userId: string): Observable<QuestionsRH> {

    const formData: FormData = new FormData();
    formData.append('categories', categories);
    formData.append('sousCategories', sousCategories);
    formData.append('titre', titre);
    formData.append('descriptions', descriptions);
    if (piecesJoint) {
      formData.append('piecesJoint', piecesJoint);
    }
    formData.append('userId', userId);

    return this.http.post<QuestionsRH>(`${this.apiUrl}/QuestionsRH/add`, formData, { headers: this.getHeaders() });

 
  }


  updateQuestionsRH(id: number, questionsRH: QuestionsRH): Observable<QuestionsRH> {
    return this.http.put<QuestionsRH>(`${this.apiUrl}/QuestionsRH/${id}`, questionsRH, { headers: this.getHeaders() });
  }

  deleteQuestionsRH(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/QuestionsRH/${id}`, { headers: this.getHeaders() });
  }

  getPdf(fileName: string, authToken: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders({ 
        'Content-Type': 'application/pdf',
        'Authorization': `Bearer ${authToken}` 
    });
    return this.http.get(`${this.apiUrl}/QuestionsRH/pdfs/${fileName}`, {
        responseType: 'blob',
        observe: 'response',
        headers: headers
    });
}
}
