import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { WebSocketService } from 'src/app/Service/WebSocket/web-socket.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  roles: string[] = [];
  fileName!: string; // Add fileName property to store the image file name
  userId!: number; // Add userId property to store the user's ID
  image!: string; // Add image property to store the image URL
  username: any;
  elementRef: any;
  isUICollapsed: boolean = false;
  dropdownOpen = false;
  public userNotifications: { userId: number, fileName: string , message : string , username :string , id : number   ,  timestamp: string // Add timestamp property
  }[] = [];

  constructor(private changeDetectorRef: ChangeDetectorRef ,private webSocketService: WebSocketService ,private router:Router,private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {

   
    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.username = this.tokenStorage.getUser().username;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

    }
     if (this.roles.includes('ROLE_GESTIONNAIRE')) {
      this.updateTimeDifference(); // Update the displayed time difference

      const authToken = this.tokenStorage.getToken();
  
      if (!authToken) {
        console.error('Authorization token not found');
        return;
      }
      this.webSocketService.getAllNotifications(authToken).subscribe((notifications: any) => {
        this.userNotifications = notifications;
      });
      let stompClient = this.webSocketService.connect();
      stompClient.connect({}, (frame: any) => {
        stompClient.subscribe('/topic/notification', (message: { body: string; }) => {
          // Add new notification to the array
          let data = JSON.parse(message.body);
          this.userNotifications.push({ userId: data.userId, fileName: data.fileName  ,  message:data.message , username : data.username  , id : data.id , timestamp : data.timestamp});
          this.updateTimeDifference(); // Update the displayed time difference
  
        });
      });
    } else if (this.roles.includes('ROLE_MANAGER'))
    {
      this.updateTimeDifference(); // Update the displayed time difference

      const authToken = this.tokenStorage.getToken();
  
      if (!authToken) {
        console.error('Authorization token not found');
        return;
      }
      this.webSocketService.getAllNotificationsManager(authToken).subscribe((notifications: any) => {
        this.userNotifications = notifications;
      });
      let stompClient = this.webSocketService.connect();
      stompClient.connect({}, (frame: any) => {
        stompClient.subscribe('/manager/notification', (message: { body: string; }) => {
          // Add new notification to the array
          let data = JSON.parse(message.body);
          this.userNotifications.push({ userId: data.userId, fileName: data.fileName  ,  message:data.message , username : data.username  , id : data.id , timestamp : data.timestamp});
          this.updateTimeDifference(); // Update the displayed time difference
  
        });
      });
    }
    
  }
  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }
  getImageUrlNotifications(userId: number, fileName: string): string {
    console.log("userIduserIduserId"+userId);

    console.log("fileNamefileNamefileNamefileName"+fileName);
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${userId}/${fileName}`;
  }
  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Prevent the click event from propagating to the document
  
    this.dropdownOpen = !this.dropdownOpen;
  }
  


  logout(): void {
    this.tokenStorage.signOut(); // Clear token storage
    this.router.navigate(['/login']); // Redirect to login page
  }

// Call this method whenever you need to update the displayed time difference
updateTimeDifference(): void {
  this.changeDetectorRef.detectChanges();
}

  toggleUICollapse() {
    this.isUICollapsed = !this.isUICollapsed;
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    // Check if elementRef is defined before accessing its properties
    if (this.elementRef && this.elementRef.nativeElement && !this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  calculateTimeDifference(timestamp: string): string {
    const currentTime = new Date().getTime();
    const notificationTime = new Date(timestamp).getTime();
    const differenceInSeconds = Math.floor((currentTime - notificationTime) / 1000);
  
    if (differenceInSeconds < 60) {
      return `${differenceInSeconds}s`;
    } else if (differenceInSeconds < 3600) {
      const differenceInMinutes = Math.floor(differenceInSeconds / 60);
      return `${differenceInMinutes}min`;
    } else if (differenceInSeconds < 86400) {
      const differenceInHours = Math.floor(differenceInSeconds / 3600);
      return `${differenceInHours}h`;
    } else if (differenceInSeconds < 2592000) {
      const differenceInDays = Math.floor(differenceInSeconds / 86400);
      return `${differenceInDays} jours`;
    } else if (differenceInSeconds < 31536000) {
      const differenceInMonths = Math.floor(differenceInSeconds / 2592000);
      return `${differenceInMonths} mois`;
    } else {
      const differenceInYears = Math.floor(differenceInSeconds / 31536000);
      return `${differenceInYears} ans`;
    }
  }
  

  confirmDeleteNotification(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this notification?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteNotification(id);
      }
    });
  }

  deleteNotification(id: number): void {
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      return;
    }
    this.webSocketService.deleteNotificationById(id, authToken).subscribe(() => {
      this.userNotifications = this.userNotifications.filter(notification => notification.id !== id);
      Swal.fire('Deleted!', 'The notification has been deleted.', 'success');
    });
  }

  handleNotificationClick(notification: { userId: number, fileName: string, message: string, username: string, id: number, timestamp: string }): void {
    if (notification.message.includes('badge')) {
      // Navigate to the specific route when the message contains "badge"
      this.router.navigate(['/badge']); // Replace '/badge-route' with the actual route
    }else if (notification.message.includes('attestation'))
     {
      this.router.navigate(['/demandeattestations']); // Replace '/badge-route' with the actual route

     } else if(notification.message.includes('conger-payer'))
      {
        this.router.navigate(['/absences']); // Replace '/badge-route' with the actual route


      }
      else if(notification.message.includes('Questions Rh'))
        {
          this.router.navigate(['/QuestionsRh']); // Replace '/badge-route' with the actual route
  
  
        }
        else if(notification.message.includes('conger-maladie'))
          {
            this.router.navigate(['/absences']); // Replace '/badge-route' with the actual route
    
    
          }
       
     
    // Perform any other actions you need when a notification is clicked
  }
}
