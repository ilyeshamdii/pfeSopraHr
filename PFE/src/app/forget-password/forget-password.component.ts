import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../_services/user.service';
import {Router} from '@angular/router';
import {ScriptStyleLoaderService} from '../Service/ScriptStyleLoaderService/script-style-loader-service.service';
import Swal from 'sweetalert2';

@Component({selector: 'app-forget-password', templateUrl: './forget-password.component.html', styleUrls: ['./forget-password.component.css']})
export class ForgetPasswordComponent implements OnInit {

    form !: FormGroup;
    submitted = false;
    successMessage : string | null = null; // Initialize successMessage as null
    errorMessage : string | null = null; // Initialize errorMessage as null
    loading : boolean = false;

    constructor(private scriptStyleLoaderService : ScriptStyleLoaderService, public service : UserService, private fb : FormBuilder, private router : Router) {}

    ngOnInit() {
        this.loadScriptsAndStyles();

        if (this.service.choixmenu == "A") {
            this.initForm();
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
    initForm() {
        this.form = this.fb.group({
            email: [
                '',
                [
                    Validators.required,, Validators.email, Validators.minLength(8)
                ]
            ]

        });
    }

    onReset() {
        this.submitted = false;

    }

    onSubmit() {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }
        this.loading = true;

        this.service.forgetPassword(this.form.value.email).subscribe((response : any) => {
          this.loading = false;
            Swal.fire({icon: 'success', title: 'Success', text: response.message}).then(() => {
                this.form.get('email') ?. reset();
                this.submitted = false;
              

            });
        }, (error) => {
            this.loading = false;

            Swal.fire({icon: 'error', title: 'Error', text: error.error.message});
        });
    }


    login() {
        this.router.navigate(['/login']);
    }

}
