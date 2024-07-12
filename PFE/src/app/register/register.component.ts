import {Component, OnInit} from '@angular/core';
import {AuthService} from '../_services/auth.service';
import {ScriptStyleLoaderService} from '../Service/ScriptStyleLoaderService/script-style-loader-service.service';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';

@Component({selector: 'app-register', templateUrl: './register.component.html', styleUrls: ['./register.component.css']})
export class RegisterComponent implements OnInit {
    form : any = {
        username: null,
        email: null,
        password: null,
        image: null,
        role: null
    };
    isSuccessful = false;
    isSignUpFailed = false;
    errorMessage = '';
    passwordHidden : boolean = true;

    constructor(private scriptStyleLoaderService : ScriptStyleLoaderService, private authService : AuthService, private router : Router) {}

    ngOnInit(): void {
        this.loadScriptsAndStyles();

    }
    togglePasswordVisibility() {
        this.passwordHidden = !this.passwordHidden;
    }
    onSubmit(): void {
        const {
            username,
            email,
            password,
            role,
            image
        } = this.form;
        

        this.authService.register(username, email, password, image,role).subscribe(data => {
            Swal.fire({icon: 'success', title: 'Success', text: 'Registration successful!'}).then((result) => {
                if (result.isConfirmed) {
                    this.router.navigate(['/login']); // Redirect to login page
                }
            });
            this.isSuccessful = true;
            this.isSignUpFailed = false;
        }, err => {
            Swal.fire({icon: 'error', title: 'Error', text: err.error.message});
            this.errorMessage = err.error.message;
            this.isSignUpFailed = true;
        });
    }
    onFileChange(event : any): void {
        const file = event.target.files[0];
        this.form.image = file;
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
}
