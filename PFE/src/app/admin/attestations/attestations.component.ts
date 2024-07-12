import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AttestationServiceService } from 'src/app/Service/AttestationService/attestation-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-attestations',
  templateUrl: './attestations.component.html',
  styleUrls: ['./attestations.component.css']
})
export class AttestationsComponent implements OnInit {
  selectedFile: File | null = null;
  selectedFileEdit: File | null = null;

  name: string = '';
  isExist: boolean = true;
  message: string = '';
  pdfPath: string = '';
  pdfPathEdit: string = '';

  pdfContent: string = ''; // New property to store PDF content
  showUpload: boolean = false;
  showGeneratePdf: boolean = false;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput2') fileInputReff!: ElementRef<HTMLInputElement>;
  @ViewChild('editModal', { static: false }) editModalRef!: ElementRef;

  @ViewChild('fileInputEdit') fileInputEditRef!: ElementRef<HTMLInputElement>;

  pdfName: any;
  attestations: any[] = [];
  pdfData: any;
  fileName: string = 'generated_pdf_1717595657203.pdf'; // Assuming this is the file name fetched from the backend
  @ViewChild('pdfModal') pdfModal: any; // Reference to the modal element
    @ViewChild('editModal') editModal: any; // Reference to the edit modal element

  editAttestation: any = {}; // Property to store the attestation being edited

  constructor(private attestationService: AttestationServiceService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.loadAttestations();

  }

  removePrefix(pdfPath: string): string {
    // Replace "attestations\" prefix with an empty string
    return pdfPath.replace(/attestations[\/\\]/, '');
  }
  fetchPdf(fileName: string): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    this.attestationService.getPdf(fileName, authToken).subscribe(response => {
      this.pdfData = response.body;
      const blob = new Blob([this.pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.showPdfInModal(url);

    });
  }
  showPdfInModal(pdfUrl: string): void {
    // Set PDF URL to the iframe inside the modal
    this.pdfModal.nativeElement.querySelector('iframe').setAttribute('src', pdfUrl);
    // Open the modal
    $(this.pdfModal.nativeElement).modal('show');
  }
  loadAttestations(): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    this.attestationService.getAllAttestations(authToken).subscribe(
      data => {
        this.attestations = data;
        console.log(this.attestations)
      },
      error => {
        console.log(error);
      }
    );
  }
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    const maxSize = 1048576; // 1 MB in bytes

    const allowedExtensions = ['pdf'];

    if (!file) {
      return; // Exit early if no file is selected
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
    
    const extension = file.name.split('.').pop()?.toLowerCase(); // Add null check with optional chaining operator (?)

    if (!extension || !allowedExtensions.includes(extension)) {
      Swal.fire('Error!', 'Please select a PDF file.', 'error');
      // Optionally clear the input field
      if (this.fileInputRef) {
        this.fileInputRef.nativeElement.value = '';
      }
      return;
    }
    this.selectedFile = file;
    this.pdfPath = file.name; // Optionally set pdfPath to display the file name
  }

  onFileSelectedUpdate(event: any): void {
    const file: File = event.target.files[0];
    const allowedExtensions = ['pdf'];

    if (!file) {
      return; // Exit early if no file is selected
    }

    const extension = file.name.split('.').pop()?.toLowerCase(); // Add null check with optional chaining operator (?)

    if (!extension || !allowedExtensions.includes(extension)) {
      Swal.fire('Error!', 'Please select a PDF file.', 'error');
      // Optionally clear the input field
      if (this.fileInputEditRef) {
        this.fileInputEditRef.nativeElement.value = '';
      }
      return;
    }
    this.selectedFileEdit = file;
    this.pdfPathEdit = file.name; // Optionally set pdfPath to display the file name
  }
  showUploadForm() {
    this.showUpload = true;
    this.showGeneratePdf = false;
  }

  // Method to show the generate PDF form
  showGeneratePdfForm() {
    this.showUpload = false;
    this.showGeneratePdf = true;
  }
  onSubmit(): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    // Perform client-side validation
    if (!this.name.trim()) {
      Swal.fire('Error!', 'Name is required', 'error');
      return;
    }
    if (!this.selectedFile) {
      this.isExist = false;
    } else {
      this.isExist = true;
    }
    this.attestationService.saveAttestation(this.selectedFile, this.name, this.isExist, authToken)
      .subscribe(response => {
        this.message = response;
        Swal.fire('Success!', this.message, 'success');
        // Reset input fields after successful submission
        this.selectedFile = null;
        this.name = '';
        this.isExist = false;
        this.pdfPath = ''; // Optionally reset pdfPath as well if needed
        if (this.fileInputReff) {
          this.fileInputReff.nativeElement.value = '';
        }
        this.loadAttestations();
      }, error => {
        if (error.error) {
          this.message = error.error;
        } else {
          this.message = 'Failed to upload file.';
        }
        console.error('Error:', error);
        Swal.fire('Error!', this.message, 'error');
      });
  }

  generatePdf(): void {
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    // Perform client-side validation
    if (!this.pdfContent.trim()) {
      Swal.fire('Error!', 'PDF Content is required', 'error');
      return;
    }

    // Call the service method to generate PDF
    this.attestationService.generatePdf(this.pdfContent, this.pdfName, authToken)
      .subscribe(response => {
        this.pdfPath = response; // Assuming response contains PDF path
        Swal.fire('Success!', 'PDF generated successfully', 'success');
        this.pdfContent = '';
        this.pdfName = '';
        this.loadAttestations();
      }, error => {
        console.error('Error:', error);
        Swal.fire('Error!', 'Failed to generate PDF', 'error');
      });
  }

  deleteAttestation(attestationId: number): void {
    // Prompt the user for confirmation before deleting the attestation
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this attestation!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // User confirmed deletion, call the deleteAttestation method from the service
        const authToken = this.tokenStorage.getToken();
        if (!authToken) {
          console.error('Authorization token not found');
          Swal.fire('Error!', 'Authorization token not found', 'error');
          return;
        }

        this.attestationService.deleteAttestation(attestationId, authToken)
          .subscribe(response => {
            // Show success message
            Swal.fire('Deleted!', 'Your attestation has been deleted.', 'success');
            // Reload the attestations after deletion
            this.loadAttestations();
          }, error => {
            console.error('Error:', error);
            Swal.fire('Error!', 'Failed to delete attestation', 'error');
          });
      }
    });
  }
  showEditModal(attestation: any): void {
    this.editAttestation = { ...attestation }; // Clone the attestation data to avoid direct modification
    $(this.editModal.nativeElement).modal('show');
  }


  onEditSubmita(): void {
    console.log(this.editAttestation)
   
  }
  onEditSubmit(): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    // Perform client-side validation
    if (!this.editAttestation.name.trim()) {
      Swal.fire('Error!', 'Name is required', 'error');
      return;
    }
 
      this.isExist = true;
   
    this.attestationService.updateAttestation(this.selectedFileEdit, this.editAttestation.name,this.editAttestation.id, this.isExist, authToken)
      .subscribe(response => {
        this.message = response;
        Swal.fire('Success!', this.message, 'success');
        // Reset input fields after successful submission
        this.selectedFile = null;
        this.name = '';
        this.isExist = false;
        this.pdfPath = ''; // Optionally reset pdfPath as well if needed
        if (this.fileInputRef) {
          this.fileInputRef.nativeElement.value = '';
        }
        this.loadAttestations();
        this.hideEditModal();


      }, error => {
        if (error.error) {
          this.message = error.error;
        } else {
          this.message = 'Failed to upload file.';
        }
        console.error('Error:', error);
        Swal.fire('Error!', this.message, 'error');
      });
  }
  hideEditModal(): void {
    const modalElement = this.editModalRef.nativeElement as HTMLElement;
    $(modalElement).modal('hide');
  }

}
