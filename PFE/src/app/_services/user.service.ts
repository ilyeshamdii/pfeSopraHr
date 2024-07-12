import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/test/';
const AUTH_API = 'http://localhost:8080/api/auth/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
   baseUrl = 'api';
  list:  any=[];

  choixmenu : string  = 'A';

  constructor(private http: HttpClient) { }

  getPublicContent(): Observable<any> {
    return this.http.get(API_URL + 'all', { responseType: 'text' });
  }

  getUserBoard(): Observable<any> {
    return this.http.get(API_URL + 'user', { responseType: 'text' });
  }

  getModeratorBoard(): Observable<any> {
    return this.http.get(API_URL + 'mod', { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(API_URL + 'admin', { responseType: 'text' });
  }

  resetPassword(token : string, pwd : string) {
  
    return this.http.get(`http://localhost:8080/api/auth/users/rest/${token}/${pwd}`);
   }  

   forgetPassword(email :string) {
 
    return this.http.get(`http://localhost:8080/api/auth/users/verif/${email}`);
   } 
   getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }
}
