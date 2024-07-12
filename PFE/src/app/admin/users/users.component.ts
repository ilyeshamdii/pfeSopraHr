import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/Models/User';
import { UsersService } from 'src/app/Service/users/users.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;

  constructor(private userService: UsersService,private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.loadUsers();

  }
  loadUsers() {
    // Set the auth token before fetching users
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');

      return;
    }
    this.userService.getAllUsers(authToken).subscribe(
      (data: User[]) => {
        this.users = data;
        console.log(this.users);
      },
      error => {
        console.log('Error fetching users:', error);
      }
    );
  }
  acceptUser(user: User) {
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    Swal.fire({
      title: 'Confirm',
      text: `Are you sure you want to accept this user ${user.username} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, accept it!',
      cancelButtonText: 'No, cancel!'
    }).then((result) => {
      if (result.isConfirmed) {

        this.isLoading = true;

        this.userService.updateStatus(user.id, true, authToken).subscribe(
          response => {
            this.handleResponse(response);
            this.ngOnInit();
            this.isLoading = false;

          },
          error => {
            console.error('Failed to update user status', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to update user status',
            });
            this.isLoading = false;

          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'User not accepted :)', 'info');
      }
    });
  }
  
  refuseUser(user: User) {
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    Swal.fire({
      title: 'Confirm',
      text: `Are you sure you want to refuse this user  ${user.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, refuse it!',
      cancelButtonText: 'No, cancel!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        this.userService.updateStatus(user.id, false, authToken).subscribe(
          response => {
            this.handleResponse(response);
            this.ngOnInit();
            this.isLoading = false;

          },
          error => {
            console.error('Failed to update user status', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to update user status',
            });
            this.isLoading = false;

          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'User not refused :)', 'info');
      }
    });
  }
  
  private handleResponse(response: any) {
    console.log('Response:', response);
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'User status updated successfully',
    });
  }
  
}
  

