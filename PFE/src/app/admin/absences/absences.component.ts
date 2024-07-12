import {Component, OnInit} from '@angular/core';
import { DonnerDTO } from 'src/app/Dto/donner-dto.model';
import {CongerMaladieService} from 'src/app/Service/CongerMaladie/conger-maladie.service';
import { DonnerServiceService } from 'src/app/Service/DonnerService/donner-service.service';
import {TokenStorageService} from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';
declare var $: any; // Declare jQuery to avoid TypeScript errors

@Component({selector: 'app-absences', templateUrl: './absences.component.html', styleUrls: ['./absences.component.css']})
export class AbsencesComponent implements OnInit {
    congerMaldierList : any[] = [];
    isLoading = false;
    donners: DonnerDTO | undefined;
    selectedConger: any;

    constructor(private donnerService: DonnerServiceService ,private congerMaladieService : CongerMaladieService, private tokenStorage : TokenStorageService) {}

    ngOnInit(): void {
      
        this.loadCongerMaladieList();
        if (typeof $ !== 'undefined') {
          console.log('jQuery is loaded and initialized!');
        } else {
          console.error('jQuery is not loaded or initialized properly!');
        }
    }
    showDonnerDetails(congerMaladieId: number) {
        this.donnerService.getDonnerByCongerMaladieId(congerMaladieId).subscribe(
          (data: DonnerDTO) => {
            this.donners = data;
            // Use type assertion to access the 'modal' property
            ($('#donnerModal') as any).modal('show');
          },
          (error: any) => {
            console.error('Error fetching Donner data:', error);
          }
        );
      }

      showDonnerDetails2(congerId: number): void {
        this.selectedConger = this.congerMaldierList.find(conger => conger.id === congerId);
        
        ($('#donnerModall') as any).modal('show');
      }
    

    
    getDonner(congerMaladieId: number): void {
        this.donnerService.getDonnerByCongerMaladieId(congerMaladieId).subscribe(
          (data: DonnerDTO) => {
            this.donners = data;
        console.log(data);
          },
          (error: any) => {
            console.error('Error fetching Donner data:', error);
          }
        );
      }
    loadCongerMaladieList() {

        const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
        if (! authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');

            return;
        }
        this.congerMaladieService.getAllCongerMaladie(authToken).subscribe((data : any) => {
            this.congerMaldierList = data;
            console.log(data)
        }, (error : any) => {
            console.log('Error fetching conger maladie list:', error);
        });
    }

    updateStatus(congerMaladieId : number, newStatus : string) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to update the status!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
                if (! authToken) {
                    console.error('Authorization token not found');
                    Swal.fire('Error!', 'Authorization token not found', 'error');
                    return;
                }
                this.isLoading = true;

                this.congerMaladieService.updateCongerMaladieStatus(congerMaladieId, newStatus, authToken).subscribe((response : any) => {
                    console.log('Status updated successfully:', response);
                    // Refresh the conger maladie list after status update
                    this.loadCongerMaladieList();
                    Swal.fire('Updated!', 'Status has been updated.', 'success');
                    this.isLoading = false;

                }, (error : any) => {
                    console.log('Error updating status:', error);
                    Swal.fire('Error!', 'Failed to update status.', 'error');
                    this.isLoading = false;

                });
            }
        });
    }
}
