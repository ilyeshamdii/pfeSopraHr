import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenStorageService } from './_services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private tokenStorage: TokenStorageService, private router: Router) {}
  canActivate(): boolean {
    const userRoles = this.tokenStorage.getUser().roles;
    if (this.tokenStorage.getToken() && (userRoles.includes('ROLE_GESTIONNAIRE') || userRoles.includes('ROLE_MANAGER'))) {
      return true; 
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
  
}
