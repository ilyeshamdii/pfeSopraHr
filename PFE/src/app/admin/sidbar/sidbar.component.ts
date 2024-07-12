
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-sidbar',
  templateUrl: './sidbar.component.html',
  styleUrls: ['./sidbar.component.css']
})
export class SidbarComponent implements OnInit {
  isUICollapsed: boolean = false;
  dropdownOpen: boolean = false;
  currentRoute!: string;
  role: any;
  public unreadMessageCount: number = 0;
  private unreadMessageCountSubscription!: Subscription;
  constructor(private websocketService: WebsocketChatService ,private router:Router,private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { 
    this.currentRoute = this.router.url;
    this.router.events.pipe(
      filter((event: NavigationEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }
  ngOnInit(): void {
    this.websocketService.connect(); // Connect to WebSocket and fetch count
    this.unreadMessageCountSubscription = this.websocketService.unreadMessageCount$.subscribe(
      count => {
        this.unreadMessageCount = count;
      }
    );
  
    if (this.tokenStorage.getToken()) {
      
      
      this.role = this.tokenStorage.getUser().roles;

    }
  }
  isActive(url: string): boolean {
    return this.currentRoute === url;
  }
  toggleUICollapse() {
    this.isUICollapsed = !this.isUICollapsed;
  }
  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Prevent the click event from propagating to the document
  
    this.dropdownOpen = !this.dropdownOpen;
  }

  public handleClickOnChatIcon(): void {
    this.websocketService.updateAllIsClickedToFalse().subscribe(
      response => {
        console.log('Update successful:', response);
        this.ngOnInit();
      },
      error => {
        console.error('Failed to update:', error);
      }
    );
  }
}
