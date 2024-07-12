import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { WebSocketService } from 'src/app/Service/WebSocket/web-socket.service';
import { ScriptService } from 'src/app/Service/script/script.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-component',
  templateUrl: './component.component.html',
  styleUrls: ['./component.component.css']
})
export class ComponentComponent implements OnInit {

  userId: any;
  roles: any;
  fileName: any;
  username: any;
  image!: string;
  dropdownOpen: boolean = false;
  message!: string;
  public userNotifications: { userId: number, fileName: string , message : string , username :string}[] = [];

  constructor( private webSocketService: WebSocketService ,private router: Router, private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      return;
    }
    this.webSocketService.getAllNotifications(authToken).subscribe((notifications: any) => {
      this.userNotifications = notifications;
    });
      // Open connection with server socket
      let stompClient = this.webSocketService.connect();
      stompClient.connect({}, (frame: any) => {
        // Subscribe to notification topic
        stompClient.subscribe('/topic/notification', (message: { body: string; }) => {
          // Update message attribute with the recent message sent from the server
          let data = JSON.parse(message.body);
          this.userNotifications.push({ userId: data.userId, fileName: data.fileName  ,  message:data.message , username : data.username});

        });
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

    }
  }
  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
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
