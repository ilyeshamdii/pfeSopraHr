import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { Router } from '@angular/router';
import { ScriptStyleLoaderService } from '../Service/ScriptStyleLoaderService/script-style-loader-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  fileName!: string; // Add fileName property to store the image file name
  userId!: number; // Add userId property to store the user's ID
  image!: string; // Add image property to store the image URL
  passwordHidden: boolean = true;

  constructor(private scriptStyleLoaderService: ScriptStyleLoaderService ,private router: Router, private authService: AuthService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.loadScriptsAndStyles();

    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

    }
  }
  loadScriptsAndStyles(): void {
    const SCRIPT_PATH_LIST = [
      'assets/frontoffice/vendors/js/vendor.bundle.base.js',
      'assets/frontoffice/vendors/chart.js/Chart.min.js',
      'assets/frontoffice/vendors/datatables.net/jquery.dataTables.js',
      'assets/frontoffice/vendors/datatables.net-bs4/dataTables.bootstrap4.js',
      'assets/frontoffice/js/dataTables.select.min.js',
      'assets/frontoffice/js/off-canvas.js',
      'assets/frontoffice/js/hoverable-collapse.js',
      'assets/frontoffice/js/template.js',
      'assets/frontoffice/js/settings.js',
      'assets/frontoffice/js/todolist.js',
      'assets/frontoffice/js/dashboard.js',
      'assets/frontoffice/js/Chart.roundedBarCharts.js',
      'https://code.jquery.com/jquery-3.6.0.min.js'
    ];
    const STYLE_PATH_LIST = [
      'assets/frontoffice/vendors/feather/feather.css',
      'assets/frontoffice/vendors/ti-icons/css/themify-icons.css',
      'assets/frontoffice/vendors/css/vendor.bundle.base.css',
      'assets/frontoffice/vendors/datatables.net-bs4/dataTables.bootstrap4.css',
      'assets/frontoffice/vendors/ti-icons/css/themify-icons.css',
      'assets/frontoffice/js/select.dataTables.min.css',
      'assets/frontoffice/css/vertical-layout-light/style.css',
      'assets/frontoffice/images/favicon.png'
    ];
    this.scriptStyleLoaderService.loadScripts(SCRIPT_PATH_LIST),
      this.scriptStyleLoaderService.loadStyles(STYLE_PATH_LIST)
    // Show the loader

  }
  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }
  onSubmit(): void {
    const { username, password } = this.form;
  
    this.authService.login(username, password).subscribe(
      data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);
  
        const userRoles = this.tokenStorage.getUser().roles;
        const status = this.tokenStorage.getUser().status;
  
        const isGestionnaire = userRoles.includes('ROLE_GESTIONNAIRE');
        const ROLE_MANAGER = userRoles.includes('ROLE_MANAGER');

        const isCollaborateur = userRoles.includes('ROLE_COLLABORATEUR');
  
        if (isGestionnaire) {
          this.showSuccessMessage('Login successful!', '/dashboard');
        } else if (isCollaborateur) {
          if (status === null) {
            this.showInfoMessage('Access Confirmation Required', 'Your access request has been submitted. Please wait for confirmation from the gestionnaire. Check your email for further instructions once the gestionnaire has responded.');
          } else if (status === false) {
            this.showErrorMessage('Access Denied', 'Your access is denied.');
          } else {
            this.showSuccessMessage('Login successful!', '/collaborateur/dashboard');
          }
        } else if (ROLE_MANAGER) {
          if (status === null) {
            this.showInfoMessage('Access Confirmation Required', 'Your access request has been submitted. Please wait for confirmation from the gestionnaire. Check your email for further instructions once the gestionnaire has responded.');
          } else if (status === false) {
            this.showErrorMessage('Access Denied', 'Your access is denied.');
          } else {
            this.showSuccessMessage('Login successful!', '/dashboard');
          }
        } else {
          this.showErrorMessage('Error', 'User is not authorized.');
        }
        
      },
      err => {
        this.showErrorMessage('Error', err.error.message);
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }
  
  private showSuccessMessage(title: string, redirectUrl?: string): void {
    Swal.fire({
      icon: 'success',
      title: title,
    }).then(() => {
      if (redirectUrl) {
        this.router.navigate([redirectUrl]).then(() => {
          window.location.reload();
        });
      }
    });
  }
  
  private showInfoMessage(title: string, text: string): void {
    Swal.fire({
      icon: 'info',
      title: title,
      text: text
    });
  }
  
  private showErrorMessage(title: string, text: string): void {
    Swal.fire({
      icon: 'error',
      title: title,
      text: text
    });
  }
  
  
  togglePasswordVisibility() {
    this.passwordHidden = !this.passwordHidden;
  }
  reloadPage(): void {
    window.location.reload();
  }
}
