import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular'; // Import CalendarOptions
import { TokenStorageService } from '../_services/token-storage.service';
import { AbscencsService } from '../Service/Abscencs/abscencs.service';
import { CongerMaladieService } from '../Service/CongerMaladie/conger-maladie.service';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css']
})
export class CalenderComponent implements OnInit {
  public calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,timeGridDay,listWeek' // Include timeGridWeek and listWeek
    },
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    events: [] // Initialize as empty array

  };
  roles: any;
  userId: any;
  fileName: any;
  username: any;
  
  constructor(private CongerMaladieService: CongerMaladieService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {

    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      // handle the case when authToken is null
      console.error('Authentication token is null.');
      return;
    }
    const userId = this.tokenStorage.getUser().id;

    this.CongerMaladieService.getByUserId(userId, authToken).subscribe(
      (data: any[]) => {
        this.calendarOptions.events = data.map(event => ({
          title: event.status,
          start: event.dateDebut,
          end: event.dateFin,
          backgroundColor: this.getStatusColor(event.status)
        }));
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return '#ffc107'; // yellow
      case 'ACCEPTED':
        return '#28a745'; // green
      case 'REFUSED':
        return '#dc3545'; // red
      default:
        return '#007bff'; // blue
    }
  }
  }


