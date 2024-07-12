import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DemandeAttestations } from 'src/app/Models/DemandeAttestations';
import { User } from 'src/app/Models/User';
import { AttestationServiceService } from 'src/app/Service/AttestationService/attestation-service.service';
import { DemandeAttestationsService } from 'src/app/Service/DemandeAttestations/demande-attestations.service';
import { UsersService } from 'src/app/Service/users/users.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-demande-attestations',
  templateUrl: './demande-attestations.component.html',
  styleUrls: ['./demande-attestations.component.css']
})
export class DemandeAttestationsComponent implements OnInit {

  users: User[] = [];
  demandeAttestations: DemandeAttestations[] = [];
  selectedUser!: User; // Assuming User interface is defined
  userList: any;
  attestations: any;
  selectedAttestation: any;
  @ViewChild('pdfModal') pdfModal: any; // Reference to the modal element
  userId: any;
  user: any = {};
  @ViewChild('pdfIframe') pdfIframe!: ElementRef;
  loading: boolean = false;

  constructor(private demandeAttestationsService: DemandeAttestationsService,
    private userService: UsersService, private attestationService: AttestationServiceService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.loadDemandeAttestations();
  }

  loadDemandeAttestations(): void {
    // Retrieve the authorization token from local storage
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    // Fetch demande attestations using the service
    this.demandeAttestationsService.getAllDemandeAttestations(authToken).subscribe(
      (data: DemandeAttestations[]) => {
        this.demandeAttestations = data;
        console.log(this.demandeAttestations);
      },
      error => {
        console.log('Error fetching demande attestations:', error);
      }
    );
  }
  loadAttestations(attestationId: number): void {

    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    this.attestationService.getAllAttestations(authToken).subscribe(
      (data: any) => { // Specify the type of data parameter
        this.attestations = data;
        console.log(this.attestations)

        const attestationList = this.attestations.find((attestationList: { id: number; }) => attestationList.id == attestationId);
        if (attestationList) {
          this.selectedAttestation = attestationList;
          this.openAttestationDetailsModal();
        } else {
          console.log('Attestation with ID ' + attestationId + ' not found');
          Swal.fire('Error!', 'Attestation with ID ' + attestationId + ' not found', 'error');
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  openAttestationDetailsModal(): void {
    $('#attestationDetailsModal').modal('show');
  }
  loadUsers(userId: number): void {
    console.log('userId', userId);

    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    this.userService.getAllUsers(authToken).subscribe(
      (data: any) => {
        this.userList = data;
        const userList = this.userList.find((userList: { id: number; }) => userList.id == userId);
        this.selectedUser = userList;

        this.openModal();
      },
      error => {
        console.log('Error fetching users:', error);
      }
    );
  }
  openModal(): void {
    $('#userDetailsModal').modal('show');
  }
  approveDemande(id: number) {
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to approve this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.demandeAttestationsService.approveDemande(id, authToken).subscribe(
          () => {
            Swal.fire('Approved!', 'The request has been approved.', 'success');
            this.loadDemandeAttestations(); // Reload the list
            this.loading = false;
          },
          error => {
            Swal.fire('Error!', 'There was an error approving the request.', 'error');
            console.log('Error approving demande:', error);
            this.loading = false;
          }
        );
      }
    });
  }

  refuseDemande(id: number) {
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to refuse this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, refuse it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.demandeAttestationsService.refuseDemande(id, authToken).subscribe(
          () => {
            Swal.fire('Refused!', 'The request has been refused.', 'success');
            this.loadDemandeAttestations(); // Reload the list
            this.loading = false;
          },
          error => {
            Swal.fire('Error!', 'There was an error refusing the request.', 'error');
            console.log('Error refusing demande:', error);
            this.loading = false;
          }
        );
      }
    });
  }







  removePrefix(pdfPath: string): string {
    // Replace "attestations\" prefix with an empty string
    return pdfPath.replace(/attestations[\/\\]/, '');
  }

  fetchPdf(fileName: string): void {


    console.log(fileName);
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    
      // Use getPdf API
      this.attestationService.getPdf(fileName, authToken)
        .subscribe(response => {
          if (response.body) { // Check if the response body is not null
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            this.showPdfInModal(url);
          } else {
            console.error('PDF content is null');
            Swal.fire('Error!', 'PDF content is null', 'error');
          }
        });
  
  }
  showPdfInModal(pdfUrl: string): void {
    // Set PDF URL to the iframe inside the modal
    this.pdfModal.nativeElement.querySelector('iframe').setAttribute('src', pdfUrl);
    // Open the modal
    $(this.pdfModal.nativeElement).modal('show');
  }

  openFullscreen(): void {
    const iframe = this.pdfIframe.nativeElement;
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) { /* Firefox */
      iframe.mozRequestFullScreen();
    } else if (iframe.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) { /* IE/Edge */
      iframe.msRequestFullscreen();
    }
  }
  
}
