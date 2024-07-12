import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class CollaborateurGuard implements CanActivate {
  constructor(private tokenStorage: TokenStorageService, private router: Router) {}

  canActivate(): boolean {
    const userRoles = this.tokenStorage.getUser().roles;
    const userStatus = this.tokenStorage.getUser().status;

    if (this.tokenStorage.getToken() && userRoles.includes('ROLE_COLLABORATEUR') && userStatus) {
      return true; 
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Access Denied',
        text: 'You are not authorized to access this page. Please login or check your email for confirmation access.',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return false;
    }
  }
}
