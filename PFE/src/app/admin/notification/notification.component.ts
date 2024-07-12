import { Component, OnInit } from '@angular/core';
import { WebSocketService } from 'src/app/Service/WebSocket/web-socket.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent  {
  public message: string = '';
  constructor(private webSocketService: WebSocketService) {
    // Open connection with server socket
    let stompClient = this.webSocketService.connect();
    stompClient.connect({}, (frame: any) => {
      // Subscribe to notification topic
      stompClient.subscribe('/topic/notification', (notification: { body: string; }) => {
        // Update message attribute with the recent message sent from the server
        this.message = notification.body;
      });
    });
  }
}