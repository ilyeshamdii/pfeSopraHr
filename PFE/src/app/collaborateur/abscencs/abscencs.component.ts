import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import * as $ from 'jquery';
import {AbscencsService} from 'src/app/Service/Abscencs/abscencs.service';
import {ScriptStyleLoaderService} from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import {TokenStorageService} from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({selector: 'app-abscencs', templateUrl: './abscencs.component.html', styleUrls: ['./abscencs.component.css']})
export class AbscencsComponent implements OnInit {

    fileName !: string;
    userId !: number;
    roles : any;
    username : any;
    image !: string;
    inProgressCount : number = 0;
    acceptedCount : number = 0;
    refusedCount : number = 0;
    inProgressData : any[] = [];
    acceptedData : any[] = [];
    refusedData : any[] = [];
    typeConger : string = ''; // Declare the typeConger variable

    message : string = '';
    start_date : string | null = null;
    end_date : string | null = null;
    fileToUpload !: File | null;
    totalLeaveDays !: number;
    responseMessage !: string; // Store response message
    errorMessage !: string;

    minDate : string;

    constructor(private scriptStyleLoaderService : ScriptStyleLoaderService, private abscencsService : AbscencsService, private http : HttpClient, private router : Router, private tokenStorage : TokenStorageService) {
        const today = new Date();
        this.minDate = today.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

    }

    refreshAndNavigateToCalendar(): void { // Reload the current route to refresh the page
        this.router.navigateByUrl('/calender').then(() => {
            window.location.reload();
            this.router.navigate(['/calender']);
        });
    }

    ngOnInit(): void {

        this.loadScriptsAndStyles();

        if (this.tokenStorage.getToken()) {
            this.roles = this.tokenStorage.getUser().roles;
            this.userId = this.tokenStorage.getUser().id;
            this.fileName = this.tokenStorage.getUser().photos;
            this.username = this.tokenStorage.getUser().username;
            this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL
            this.getTotalSolde(this.userId);
        }


        $(document).ready(function () {
            let current_fs: JQuery<HTMLElement>,
                next_fs: JQuery<HTMLElement>,
                previous_fs: JQuery<HTMLElement>; // fieldsets
            let opacity: number;

            $(".next").click(function () { // Check if the current step is valid before proceeding
                if (! isStepValid($(this).parent())) {
                    return; // Abort moving to the next step
                }current_fs = $(this).parent();
                next_fs = $(this).parent().next();

                // Add Class Active
                $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

                // Show the next fieldset
                next_fs.show();
                // Hide the current fieldset with style
                current_fs.animate({
                    opacity: 0
                }, {
                    step: function (now) { // for making fieldset appear animation
                        opacity = 1 - now;

                        current_fs.css({'display': 'none', 'position': 'relative'});
                        next_fs.css({'opacity': opacity});
                    },
                    duration: 600
                });
            });

            $(".previous").click(function () {
                current_fs = $(this).parent();
                previous_fs = $(this).parent().prev();

                // Remove class active
                $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

                // Show the previous fieldset
                previous_fs.show();

                // Hide the current fieldset with style
                current_fs.animate({
                    opacity: 0
                }, {
                    step: function (now) { // for making fieldset appear animation
                        opacity = 1 - now;

                        current_fs.css({'display': 'none', 'position': 'relative'});
                        previous_fs.css({'opacity': opacity});
                    },
                    duration: 600
                });
            });

            $('.radio-group .radio').click(function () {
                $(this).parent().find('.radio').removeClass('selected');
                $(this).addClass('selected');
            });

            $(".submit").click(function () {
                return false;
            });

            function isStepValid(this: any, step: JQuery<HTMLElement>): boolean { // Check if the step is valid (e.g., message is entered)
                let isValid: boolean = true;
                if (step.attr('id') === 'leave-type-fieldset' && !$('#congerType').val()) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'Please select the type of leave!',
                        confirmButtonText: 'OK'
                    });
                    isValid = false;
                }
        
                
                if (step.find('textarea[name="message"]').length > 0 && (step.find('textarea[name="message"]').val()as string).trim() === '') { // Show SweetAlert confirmation dialog
                    Swal.fire({icon: 'warning', title: 'Oops...', text: 'Please write your message!', confirmButtonText: 'OK'});
                    isValid = false;
                }

                // Check if "Depuis" and "Jusqu'au" fields are empty
                if (step.find('input[name="start_date"]').length > 0 && (step.find('input[name="start_date"]').val()as string).trim() === '') {
                    Swal.fire({icon: 'warning', title: 'Oops...', text: 'Please select a start date!', confirmButtonText: 'OK'});
                    isValid = false;
                }
                if (step.find('input[name="end_date"]').length > 0 && (step.find('input[name="end_date"]').val()as string).trim() === '') {
                    Swal.fire({icon: 'warning', title: 'Oops...', text: 'Please select an end date!', confirmButtonText: 'OK'});
                    isValid = false;
                }
               
                
                // Check if start date is less than end date
                const startDateValue = new Date(step.find('input[name="start_date"]').val()as string);
                const endDateValue = new Date(step.find('input[name="end_date"]').val()as string);
                if (startDateValue >= endDateValue) {
                    Swal.fire({icon: 'warning', title: 'Oops...', text: 'Start date must be earlier than end date!', confirmButtonText: 'OK'});
                    isValid = false;
                }
                let justificatifInput = step.find('input[name="justificatif"]');
                let file: File |null = null;
                if (justificatifInput.length > 0) {
                    const inputElement = justificatifInput[0] as HTMLInputElement; // Narrow down the type to HTMLInputElement
                    if (inputElement.files && inputElement.files.length > 0) {
                        file = inputElement.files[0];
                    }

                    if (! file) { // No file selected
                        Swal.fire({icon: 'warning', title: 'Oops...', text: 'Please select a file!', confirmButtonText: 'OK'});
                        isValid = false;
                    } else {
                        let validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
                        let isValidExtension = validExtensions.some(ext => file ?. name.toLowerCase().endsWith(ext));
                        if (! isValidExtension) { // Invalid file extension
                            Swal.fire({icon: 'warning', title: 'Oops...', text: 'Please select a file with a valid extension (.pdf, .png, .jpg, .jpeg)!', confirmButtonText: 'OK'});
                            isValid = false;
                        }
                    }
                }

                return isValid;
            }


        });

        this.fetchRequestCounts();

    }
    fetchRequestCounts(): void {
        if (!this.userId) {
            console.error('User ID not found.');
            return;
        }

        this.http.get<any>(`/api/CongerMaladie/count/${
            this.userId
        }`).subscribe(response => {
            this.inProgressCount = response.inProgress;
            this.acceptedCount = response.accepted;
            this.refusedCount = response.refused;
        }, error => {
            console.error('Error fetching request counts:', error);
        });
    }

    fetchData(status : string) {

        this.http.get<any[]>(`/api/CongerMaladie/${status}/${
            this.userId
        }`).subscribe((data) => { // Process the fetched data and display it in the modal
            switch (status) {
                case 'IN_PROGRESS':
                    this.inProgressData = data;
                    break;
                case 'ACCEPTED':
                    this.acceptedData = data;
                    break;
                case 'REFUSED':
                    this.refusedData = data;
                    break;
                default:
                    break;
            }
            console.log(data);
        }, (error) => {
            console.error('Error fetching data:', error);
        });
    }

    showModal(status : string) {
        switch (status) {
            case 'IN_PROGRESS':
                this.fetchData('IN_PROGRESS');

                break;
            case 'ACCEPTED':
                this.fetchData('ACCEPTED');

                break;
            case 'REFUSED':
                this.fetchData('REFUSED');
                break;
            default:
                break;
        }
    }

    showModalById(modalId : string) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.setAttribute('aria-modal', 'true');
        }
    }


    submitForm(): void {
        console.log("start_date" + this.start_date)
        console.log("end_date" + this.end_date)
        const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
        if (! authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');
            return;
        }

        if (this.message && this.start_date && this.end_date && this.fileToUpload) {
            const formData = new FormData();
            formData.append('file', this.fileToUpload);
            formData.append('message', this.message);
            formData.append('startDate', this.start_date);
            formData.append('endDate', this.end_date);
            formData.append('typeConger', this.typeConger); // Append typeConger to formData

            console.log(formData);
            this.abscencsService.submitLeaveRequest(formData, authToken).subscribe(response => { // Handle successful submission
                console.log(response);
                Swal.fire('Success!', 'Leave request submitted successfully!', 'success');
                this.responseMessage = response.message; // Set the response message
                this.resetForm(); // Reset the form

                this.ngOnInit();
            }, error => { // Handle error
                console.error(error);
                let errorMessage = 'An error occurred while submitting the leave request.';
                if (error && error.error && error.error.message) {
                    errorMessage = error.error.message;
                }
                this.errorMessage = errorMessage; // Set the response message

                Swal.fire('Error!', errorMessage, 'error');
            });
        } else { // Handle validation error
            console.log('Please fill in all required fields.');
            Swal.fire('Error!', 'Please fill in all required fields.', 'error');
        }
    }

    formatDate(dateString : string): string { // Assuming dateString is in format 'YYYY-MM-DD'
        const parts = dateString.split('-');
        return `${
            parts[0]
        }-${
            parts[1].padStart(2, '0')
        }-${
            parts[2].padStart(2, '0')
        }`;
    }
    onFileSelected(event : any): void {
        this.fileToUpload = event.target.files[0];
    }

    refreshComponent(): void { // Resetting the component state or navigating to the same route again
        const currentRoute = this.router.url; // Get the current route
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => { // Navigate back to the current route
            this.router.navigate([currentRoute]);
        });
    }
    getImageUrl(): string { // Assuming your backend endpoint for retrieving images is '/api/images/'
        return `http://localhost:8080/api/auth/images/${
            this.userId
        }/${
            this.fileName
        }`;
    }


    resetForm(): void {
        this.message = '';
        this.start_date = null;
        this.end_date = null;
        this.typeConger = '';
        this.fileToUpload = null;
    }
    getTotalSolde(userId : number): void {

        const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
        if (! authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');
            return;
        }
        this.abscencsService.getTotalSolde(userId, authToken).subscribe(data => {
            this.totalLeaveDays = data;
        });
    }
    loadScriptsAndStyles(): void {
        const SCRIPT_PATH_LIST = [
            'https://code.jquery.com/jquery-3.6.0.min.js', // Load jQuery first
            'assets/frontoffice/vendors/js/vendor.bundle.base.js',
            'assets/frontoffice/vendors/chart.js/Chart.min.js',
            'assets/frontoffice/js/off-canvas.js',
            'assets/frontoffice/js/hoverable-collapse.js',
            'assets/frontoffice/js/template.js',
            'assets/frontoffice/js/settings.js',
            'assets/frontoffice/js/todolist.js',
            'assets/frontoffice/js/dashboard.js',
            'assets/frontoffice/js/Chart.roundedBarCharts.js'
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

        this.scriptStyleLoaderService.loadScripts(SCRIPT_PATH_LIST);
        this.scriptStyleLoaderService.loadStyles(STYLE_PATH_LIST);
    }

}
