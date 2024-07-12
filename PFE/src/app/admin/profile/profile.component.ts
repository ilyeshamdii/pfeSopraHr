import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/Service/users/users.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  imageUrl: any;
  userId: any;
  currentPassword: string = '';
  newPassword: string = '';
  username: any;
  fileName!: string; // Add fileName property to store the image file name

  constructor(
    private UsersService: UsersService,
    private http: HttpClient,
    private router: Router,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.userId = this.tokenStorage.getUser().id;
      this.user.username = this.tokenStorage.getUser().username;
      this.user.email = this.tokenStorage.getUser().email;
      this.fileName = this.tokenStorage.getUser().photos;
      this.username = this.tokenStorage.getUser().username;

    }
  }

  onFileSelected(event: any) {
    // Read selected image file and display preview
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  updateProfile(image: File | null) {
    const authToken = this.tokenStorage.getToken();
    const userId = this.tokenStorage.getUser().id;
  
    if (!authToken || !userId) {
      console.error('Authorization token or userId not found');
      Swal.fire('Error!', 'Authorization token or userId not found', 'error');
      return;
    }
  
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('username', this.user.username);
    formData.append('email', this.user.email);
  
    if (image) {
      formData.append('image', image);
    }
  
    this.UsersService.updateUserProfile(userId, formData, authToken).subscribe(
      (data: any) => {
        console.log('Profile updated successfully:', data);
        Swal.fire('Success!', 'Profile updated successfully', 'success');
        this.tokenStorage.signOut(); // Clear token storage
        this.router.navigate(['/login']); // Redirect to login page
      },
      (error: any) => {
        console.log('Error updating profile:', error);
        Swal.fire('Error!', 'Failed to update profile', 'error');
      }
    );
  }
  changePassword() {
    const authToken = this.tokenStorage.getToken();
    const userId = this.tokenStorage.getUser().id;

    if (!authToken || !userId) {
      console.error('Authorization token or userId not found');
      Swal.fire('Error!', 'Authorization token or userId not found', 'error');
      return;
    }

    this.UsersService.updatePassword(userId, this.currentPassword, this.newPassword, authToken).subscribe(
      (data: any) => {
        console.log('Password updated successfully:', data);
        Swal.fire('Success!', 'Password updated successfully', 'success');
        // Reset password fields
        this.currentPassword = '';
        this.newPassword = '';
      },
      (error: any) => {
        console.log('Error updating password:', error);
        Swal.fire('Error!', 'Failed to update password',error);
      }
    );
  }
  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }
}
