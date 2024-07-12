import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

export interface Message {
  sender: string;
  content: string;
  timestamp: string;
  fileName?: string; // Include fileName property if you are storing image file names
  userId?: string; // Include fileName property if you are storing image file names
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  public message: string = '';
  public combinedMessages: Message[] = [];
  fileName!: string;
  userId: any;
  image!: string;
  username: any;

  constructor(private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService, public websocketChatService: WebsocketChatService) { }

  ngOnInit(): void {
    this.websocketChatService.connect();
    this.loadMessages();
    if (this.tokenStorage.getToken()) {
      this.username = this.tokenStorage.getUser().username;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.image = this.getImageUrl();
    }


    this.loadScriptsAndStyles();

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
  loadMessages(): void {
    const userId = this.tokenStorage.getUser().id;
    this.websocketChatService.getPersistedMessages(userId).subscribe((messages) => {
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaa", messages)
      this.websocketChatService.privateMessages2 = messages;
      this.combinedMessages = this.websocketChatService.publicMessages.concat(this.websocketChatService.privateMessages2);


    });
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.websocketChatService.sendMessage(this.message, this.fileName);
      const now = new Date();
      now.setHours(now.getHours() + 1); // Add one hour to the current time

      const formattedTimestamp = now.toISOString().split('.')[0]; // '2024-06-26T09:57:25'
      const newMessage: Message = {
        sender: 'collaborator', // assuming 'collaborator' as the identifier for the user
        content: this.message,
        timestamp: formattedTimestamp,
        fileName: this.fileName,
        userId: this.userId
      };

      this.websocketChatService.publicMessages.push(newMessage);
      this.message = '';
    }
  }


  ngOnDestroy(): void {
    this.websocketChatService.disconnect();
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString(); // Example format, adjust as needed
  }

  isCollaboratorMessage(msg: Message): boolean {
    return this.websocketChatService.publicMessages.includes(msg);
  }

  isGestionnaireMessage(msg: Message): boolean {
    return this.websocketChatService.privateMessages2.includes(msg);
  }

  getImageUrl(): string {
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }
}
