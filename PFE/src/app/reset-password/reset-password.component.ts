import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../_services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MustMatch } from '../validator/must-match.validator';
import Swal from 'sweetalert2';
import { ScriptStyleLoaderService } from '../Service/ScriptStyleLoaderService/script-style-loader-service.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  submitted = true; // Change to true to display validation messages on load
  token!: string;
  form!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  passwordHidden: boolean = true;
  confirmPasswordHidden: boolean = true;

  constructor(private scriptStyleLoaderService: ScriptStyleLoaderService ,public service: UserService, public fb: FormBuilder,
    private router: Router, private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.loadScriptsAndStyles();

    this.infoForm();
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });

    this.f.token.setValue(this.token);
  }
  togglePasswordVisibility() {
    this.passwordHidden = !this.passwordHidden;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordHidden = !this.confirmPasswordHidden;
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
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
  infoForm() {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      pwd: ['', [Validators.required]],
      token: ['']
    }, {
      validator: MustMatch('password', 'pwd')
    });
  }

  onReset() {
    this.submitted = false;
    this.router.navigate(['/users']);
  }

  onSubmit() {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    this.service.resetPassword(this.token, this.form.value.password)
      .subscribe(
        (response: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error.message
          });
        }
      );
  }
  
}
