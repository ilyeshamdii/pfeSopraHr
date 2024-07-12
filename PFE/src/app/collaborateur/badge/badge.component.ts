import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Badge } from 'src/app/Models/badge';
import { BadgeService } from 'src/app/Service/BadgeService/BadgeService/badge-service.service';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({ selector: 'app-badge', templateUrl: './badge.component.html', styleUrls: ['./badge.component.css'] })
export class BadgeComponent implements OnInit {
    roles: string[] = [];
    fileName !: string; // Add fileName property to store the image file name
    userId !: number; // Add userId property to store the user's ID
    image !: string; // Add image property to store the image URL
    imageBadge !: string; // Add image property to store the image URL
    isPrinting: boolean = false;
    @ViewChild('fileInput2') fileInputReff!: ElementRef<HTMLInputElement>;
    @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

    username: any;
    dropdownOpen: boolean = false;
    elementRef: any;
    isUICollapsed: boolean = false;
    badges !: Badge[];
    selectedFile: File | null = null;
    badgeId !: number;

    matricule !: string;
    createdBadge !: Badge;
    Newusername: any;
    Newmatricule: any;
    showBadgeForm: boolean = false;
    showBadgeRequestPending: boolean = false; // Declare the property here
    showBadgeRequestAccepter: boolean = false;
    showBadgeRequestRefuse: boolean = false;

    badgess: Badge[] = []; // Initialize badges array
    imageFile: File | undefined; // Initialize imageFile variable

    constructor(private http: HttpClient, private badgeService: BadgeService, private router: Router, private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

    ngOnInit(): void {
        this.loadScriptsAndStyles();
        if (this.tokenStorage.getToken()) {
            this.roles = this.tokenStorage.getUser().roles;
            this.userId = this.tokenStorage.getUser().id;
            this.fileName = this.tokenStorage.getUser().photos;
            this.username = this.tokenStorage.getUser().username;
            this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL
            console.log("fileNamefileNamefileName" + this.fileName)

        }
        this.checkBadgeStatus();
        this.fetchBadgesByUserId(this.userId); // Replace 123 with the actual user ID

    }
    fetchBadgesByUserId(userId: number): void {
        const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
        if (!authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');

            return;
        }
        this.badgeService.getBadgesByUserId(userId, authToken).subscribe((data: Badge[]) => {
            this.badges = data;
            console.log(data)

        }, error => {
            console.log(error); // Handle error
        });
    }


    createBadge() {
        const authToken = this.tokenStorage.getToken();
        if (!authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');
            return;
        }

        if (!this.selectedFile) {
            Swal.fire('Error!', 'Image is required', 'error');
            return;
          }

        this.badgeService.createBadgeForUser(this.userId, this.Newusername, this.Newmatricule, this.selectedFile, authToken).subscribe((data: Badge) => {
            console.log('Badge created successfully:', data);
            Swal.fire('Success!', 'Badge created successfully', 'success');
            this.ngOnInit();
            this.createdBadge = data;
            this.loadScriptsAndStyles();

        }, (error) => {
            console.error('Error creating badge:', error);
            Swal.fire('Error!', 'Error creating badge', 'error');
        });
    }
  
    checkBadgeStatus() {
        const authToken = this.tokenStorage.getToken();
        if (!authToken) {
            console.error('Authorization token not found');
            return;
        }

        // Make API request to check badge status
        this.badgeService.getBadgeStatus(this.userId, authToken).subscribe((response: any) => {
            console.log("response.isDeleted",response.isDeleted);
            console.log("response.status",response.status);


            // Determine badge status and update UI accordingly
            if (response.status === 'accepter' && !response.isDeleted) {
                this.showBadgeForm = true;
                this.showBadgeRequestAccepter = true;
            } else if (response.status === 'en cours' && !response.isDeleted) {
                this.showBadgeForm = true;
                this.showBadgeRequestPending = true;
            } else if (response.status === 'refuser' && !response.isDeleted) {
                this.showBadgeForm = true;
                this.showBadgeRequestRefuse = true;
            } else {
                this.showBadgeForm = false;
            }
        }, (error) => {
            console.error('Error checking badge status:', error);
            // Handle error
        });
    }

    getImageUrl(): string { // Assuming your backend endpoint for retrieving images is '/api/images/'
        return `http://localhost:8080/api/auth/images/${this.userId
            }/${this.fileName
            }`;
    }
    getImageUrlBadge(badgeId: number, fileBadge: string): string {
        return `http://localhost:8080/api/badges/images/${badgeId}/${fileBadge}`;


    }
    printBadge(): void {
        this.isPrinting = true; // Set isPrinting to true when printing starts
        const printContents = document.getElementById('badge-container')?.innerHTML;
        const originalContents = document.body.innerHTML;


        if (printContents !== undefined) {
            document.body.innerHTML = printContents;
        } else {
            console.error('Badge container not found');
        }
        // Function to check if all images have loaded
        const checkImagesLoaded = () => {
            const images = document.querySelectorAll('img');
            let allLoaded = true;
            images.forEach((img) => {
                if (!img.complete || img.naturalWidth === 0) {
                    allLoaded = false;
                    return;
                }
            });
            return allLoaded;
        };

        // Check if all images are loaded before printing
        const checkPrint = () => {
            if (checkImagesLoaded()) { // Trigger the print dialog
                window.print();

                // Restore the original document body content after printing
                document.body.innerHTML = originalContents;

                this.isPrinting = false; // Set isPrinting back to false after printing
                window.location.reload();

            } else { // If images are not loaded yet, wait and check again
                setTimeout(checkPrint, 100);
            }
        };

        // Initiate the printing process
        checkPrint();
    }

    resetBadgeRequest() {
        console.log(this.userId)
        const authToken = this.tokenStorage.getToken();
        if (!authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');
            return;
        }

        // Call the service method to delete the old badge request
        this.badgeService.deleteBadgeRequest(this.userId, authToken).subscribe(() => {
            // After successful deletion, set the flag to show the badge request form
            this.showBadgeRequestRefuse = false; // Set showBadgeRequestRefuse to false

            Swal.fire('Success!', 'Ancienne demande de badge supprimée. Veuillez refaire la demande.', 'success');
            this.ngOnInit();
        }, (error) => {
            console.error('Error deleting old badge request:', error);
            Swal.fire('Error!', 'Error deleting old badge request', 'error');
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
      
  
    toggleDropdown(event: Event): void {
        event.stopPropagation(); // Prevent the click event from propagating to the document

        this.dropdownOpen = !this.dropdownOpen;
    }


    logout(): void {
        this.tokenStorage.signOut(); // Clear token storage
        this.router.navigate(['/login']); // Redirect to login page
    }


    toggleUICollapse() {
        this.isUICollapsed = !this.isUICollapsed;
    }
    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        const maxSize = 1048576; // 1 MB in bytes
        const allowedExtensions = ['png','jpg','jpeg'];

        if (!file) {
            return; // Exit early if no file is selected
          }
        
          const extension = file.name.split('.').pop()?.toLowerCase(); // Add null check with optional chaining operator (?)
          if (!extension || !allowedExtensions.includes(extension)) {
            Swal.fire('Error!', 'Please select a png , jpeg , jpg  file.', 'error');
            // Optionally clear the input field
            if (this.fileInputReff) {
              this.fileInputReff.nativeElement.value = '';
            }
            return;
          }
          if (file.size > maxSize) {
            Swal.fire({
              icon: 'error',
              title: 'File too large',
              text: `The selected file exceeds the maximum size of 1 MB. Please choose a smaller file.`,
            });
            this.selectedFile = null;
            this.fileInputReff.nativeElement.value = ''; // Clear the input field
            return;
          }
          this.selectedFile = file;

    }
    onFileChange(event: any) {
        const file: File = event.target.files[0];
        const maxSize = 1048576; // 1 MB in bytes
        const allowedExtensions = ['png','jpg','jpeg'];

        if (!file) {
            return; // Exit early if no file is selected
          }
        
          const extension = file.name.split('.').pop()?.toLowerCase(); // Add null check with optional chaining operator (?)
          if (!extension || !allowedExtensions.includes(extension)) {
            Swal.fire('Error!', 'Please select a png , jpeg , jpg  file.', 'error');
            // Optionally clear the input field
            if (this.fileInputRef) {
              this.fileInputRef.nativeElement.value = '';
            }
            return;
          }
          if (file.size > maxSize) {
            Swal.fire({
              icon: 'error',
              title: 'File too large',
              text: `The selected file exceeds the maximum size of 1 MB. Please choose a smaller file.`,
            });
            this.selectedFile = null;
            this.fileInputRef.nativeElement.value = ''; // Clear the input field
            return;
          }
          this.imageFile = file;


    }
    updateBadge() {
        const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
        if (!authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');

            return;
        }
        if (this.badges.length > 0) {
            const badgeId = this.badges[0].id; // Get badge ID from the first badge (assuming only one badge is displayed)
            const username = this.badges[0].username; // Get username from the first badge's user email
            const matricule = this.badges[0].matricule; // Get matricule from the first badge

            // Call updateBadge method from the service to update the badge
            this.badgeService.updateBadge(badgeId, username, matricule, this.imageFile, authToken)
                .subscribe(
                    (data) => {
                        console.log('Badge updated successfully:', data);
                        Swal.fire('Success', 'Badge updated successfully', 'success');
                        // Handle success
                        this.ngOnInit();
                        this.resetImageInput(); // Reset image input field

                    },
                    (error) => {
                        console.error('Error updating badge:', error);
                        Swal.fire('Error', 'Error updating badge', 'error');
                        // Handle error
                    }
                );
        } else {
            console.error('No badges to update');
            // Handle error - no badges found
        }
    }

    resetImageInput() {
        this.imageFile = undefined; // Reset the value of the imageFile variable
        const fileInput = document.getElementById('imageInput') as HTMLInputElement;
        fileInput.value = ''; // Clear the value of the file input
    }

}
