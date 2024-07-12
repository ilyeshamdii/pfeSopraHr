import { Injectable } from '@angular/core';
import * as SockJs from 'sockjs-client';
import * as Stomp from 'stompjs';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketUserService {
  private stompClient: Stomp.Client | undefined;
  private userId: number | undefined;

  constructor(private tokenStorageService: TokenStorageService) {
    this.userId = this.tokenStorageService.getUser().id;
  }

  public connect() {
    const authToken = this.tokenStorageService.getToken();
    const socket = new SockJs('http://localhost:8080/socket');
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({ Authorization: `Bearer ${authToken}` }, () => {
      console.log('Connected to WebSocket');
      this.subscribeToUserNotifications();
    });
  }

  private subscribeToUserNotifications() {
    if (this.stompClient && this.userId) {
      this.stompClient.subscribe(`/user/${this.userId}/queue/notification`, (message) => {
        const notification = JSON.parse(message.body);
        console.log(notification);
      });
    }
  }

  public disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    }
  }
}
