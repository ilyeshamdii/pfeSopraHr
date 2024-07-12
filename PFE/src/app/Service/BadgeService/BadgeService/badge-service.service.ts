import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Badge} from 'src/app/Models/badge';

@Injectable({providedIn: 'root'})export class BadgeService {

    private baseUrl = 'http://localhost:8080/api/badges/';
    private baseUrl2 = 'http://localhost:8080/api/badges';

    constructor(private http : HttpClient) {}

    createBadgeForUser(userId : number, username : string, matricule : string, image : File | null, authToken : string): Observable < Badge > {
        const formData: FormData = new FormData();
        formData.append('Newusername', username);
        formData.append('Newmatricule', matricule);
        if (image) {
            formData.append('image', image);
        }

        const headers = new HttpHeaders(
            {'Authorization': `Bearer ${authToken}`}
        );

        const requestOptions = {
            headers: headers
        };

        return this.http.post<Badge>(`${
            this.baseUrl2
        }/${userId}`, formData, requestOptions);
    }

    updateBadge(badgeId: number, username: string, matricule: string, image?: File, authToken?: string): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('username', username);
        formData.append('matricule', matricule);
        if (image) {
          formData.append('image', image, image.name);
        }
    
        let headers = new HttpHeaders();
        if (authToken) {
          headers = headers.set('Authorization', `Bearer ${authToken}`);
        }
        // Note: Content-Type will be automatically set to multipart/form-data by FormData
    
        return this.http.put(`${this.baseUrl2}/${badgeId}`, formData, { headers: headers });
      }
    getBadgeStatus(userId : number, authToken : string): Observable < any > { // Construct headers with authorization token
        const headers = new HttpHeaders(
            {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
        );

        // Include headers in the request options
        const requestOptions = {
            headers: headers
        };

        // Make the HTTP GET request to check badge status
        return this.http.get<any>(`${
            this.baseUrl2
        }/status/${userId}`, requestOptions);
    }
    getAllBadges(authToken : string): Observable < Badge[] > { // Construct headers with authorization token
        const headers = new HttpHeaders(
            {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
        );

        // Include headers in the request options
        const requestOptions = {
            headers: headers
        };

        // Make the HTTP GET request to fetch all badges
        return this.http.get<Badge[]>(this.baseUrl, requestOptions);
    }
    acceptBadge(badgeId : number, authToken : string): Observable < any > { // Construct headers with authorization token
        const headers = new HttpHeaders(
            {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
        );

        // Include headers in the request options
        const requestOptions = {
            headers: headers
        };

        // Make the HTTP PUT request with the provided authorization token to accept the badge
        return this.http.put(`${
            this.baseUrl2
        }/accept/${badgeId}`, null, requestOptions);
    }

    refuseBadge(badgeId : number, authToken : string): Observable < any > { // Construct headers with authorization token
        const headers = new HttpHeaders(
            {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
        );

        // Include headers in the request options
        const requestOptions = {
            headers: headers
        };

        // Make the HTTP PUT request with the provided authorization token to refuse the badge
        return this.http.put(`${
            this.baseUrl2
        }/refuse/${badgeId}`, null, requestOptions);
    }


    getBadgesByUserId(userId : number, authToken : string): Observable < Badge[] > { // Construct headers with authorization token
        const headers = new HttpHeaders(
            {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
        );

        // Include headers in the request options
        const requestOptions = {
            headers: headers
        };

        // Make the HTTP GET request to fetch badges by user ID
        return this.http.get<Badge[]>(`${
            this.baseUrl2
        }/user/${userId}`, requestOptions);
    }
    getBadgesByUserIdTotale(userId : number, authToken : string): Observable < Badge[] > { // Construct headers with authorization token
        const headers = new HttpHeaders(
            {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
        );

        // Include headers in the request options
        const requestOptions = {
            headers: headers
        };

        // Make the HTTP GET request to fetch badges by user ID
        return this.http.get<Badge[]>(`${
            this.baseUrl2
        }/TotaleBadge/${userId}`, requestOptions);
    }

    deleteBadgeRequest(userId: number, authToken: string): Observable<any> {
        const headers = new HttpHeaders({
          'Authorization': 'Bearer ' + authToken
        });
        return this.http.delete(`${this.baseUrl2}/${userId}`, { headers });
      }
}
