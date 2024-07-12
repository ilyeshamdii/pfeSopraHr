import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DonnerDTO } from 'src/app/Dto/donner-dto.model';

@Injectable({
  providedIn: 'root'
})
export class DonnerServiceService {
  private baseUrl = 'http://localhost:8080/api/Gestionnaire';

  constructor(private http: HttpClient) { }

  getDonnerByCongerMaladieId(congerMaladieId: number): Observable<DonnerDTO> {
    let headers = new HttpHeaders();
    const authToken = localStorage.getItem('authToken'); // Assuming the token is stored in localStorage
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }

    return this.http.get<DonnerDTO>(`${this.baseUrl}/donner/conger-maladie/${congerMaladieId}`, { headers });
  }

}
