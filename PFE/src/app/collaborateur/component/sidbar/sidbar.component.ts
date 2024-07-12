import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-sidbar',
  templateUrl: './sidbar.component.html',
  styleUrls: ['./sidbar.component.css']
})
export class SidbarComponent implements OnInit {
  isUICollapsed: boolean = false;
  dropdownOpen: boolean = false;

  constructor(private router:Router,private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
  }

  toggleUICollapse() {
    this.isUICollapsed = !this.isUICollapsed;
  }
  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Prevent the click event from propagating to the document
  
    this.dropdownOpen = !this.dropdownOpen;
  }
}
