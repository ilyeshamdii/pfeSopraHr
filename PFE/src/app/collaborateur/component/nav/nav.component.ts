import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { WebSocketService } from 'src/app/Service/WebSocket/web-socket.service';
import { WebsocketUserService } from 'src/app/Service/websocketUser/websocket-user.service';
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
  userNotifications: any[] = []; // List to store notifications

  constructor( private changeDetectorRef: ChangeDetectorRef, private webSocketService: WebSocketService ,private router:Router,private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.loadScriptsAndStyles();

    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.username = this.tokenStorage.getUser().username;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

    }
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      return;
    }
    this.webSocketService.getNotificationsForUser(this.userId, authToken).subscribe((notifications: any[]) => {
      this.userNotifications = notifications;
    });
    let stompClient = this.webSocketService.connect();
    stompClient.connect({}, (frame: any) => {
      console.log('Connected to WebSocket:', frame);

      // Subscribe to the user-specific queue
      stompClient.subscribe(`/user/${this.userId}/queue/notification`, (message: { body: string; }) => {
        console.log('Received a message:', message);
        let data = JSON.parse(message.body);
        this.userNotifications.push(data); // Add the notification to the list
        this.updateTimeDifference(); // Update the displayed time difference

        console.log('Parsed message data:', data);
      }, (error: any) => {
        console.error('Subscription error:', error);
      });
    }, (error: any) => {
      console.error('Connection error:', error);
    });
  }
  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Prevent the click event from propagating to the document
  
    this.dropdownOpen = !this.dropdownOpen;
  }
  getImageUrlNotifications(userId: number, fileName: string): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${userId}/${fileName}`;
  }

  updateTimeDifference(): void {
    this.changeDetectorRef.detectChanges();
  }
  logout(): void {
    this.tokenStorage.signOut(); // Clear token storage
    this.router.navigate(['/login']); // Redirect to login page
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




