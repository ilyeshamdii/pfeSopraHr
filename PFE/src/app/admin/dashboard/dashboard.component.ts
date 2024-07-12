import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttestationServiceService } from 'src/app/Service/AttestationService/attestation-service.service';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { BadgeService } from 'src/app/Service/BadgeService/BadgeService/badge-service.service';
import { DemandeAttestations } from 'src/app/Models/DemandeAttestations';
import { DemandeAttestationsService } from 'src/app/Service/DemandeAttestations/demande-attestations.service';
import { User } from 'src/app/Models/User';
import { UsersService } from 'src/app/Service/users/users.service';
import { CongerMaladieService } from 'src/app/Service/CongerMaladie/conger-maladie.service';
import { QuestionsRHService } from 'src/app/Service/QuestionsRH/questions-rh.service';
import { QuestionsRH } from 'src/app/Models/QuestionsRH';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: any;
  role: any;
  attestations: any[] = [];
  badges: any[] = [];
  demandeAttestations: DemandeAttestations[] = [];
  users: User[] = [];
  congerMaldierList : any[] = [];

  // Properties for Conger_Maladie chart
  public congerMaladieChartData: ChartDataSets[] = [];
  public congerMaladieChartLabels: Label[] = [];
  public congerMaladieChartOptions: ChartOptions = {
    responsive: true,
  };
  public congerMaladieChartColors: Color[] = [{
    backgroundColor: []
  }];
  public congerMaladieChartLegend = true;
  public congerMaladieChartType: ChartType = 'bar';
  public congerMaladieChartPlugins = [];



  public barChartData: ChartDataSets[] = [];
  public barChartLabels: Label[] = [];
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(0,123,255,0.5)',
    },
  ];
  public barChartLegend = true;
  public barChartType: ChartType = 'line';
  public barChartPlugins = [];
 // Properties for badges chart
 public badgeChartData: ChartDataSets[] = [];
 public badgeChartLabels: Label[] = [];
 public badgeChartOptions: ChartOptions = {
   responsive: true,
 };
 public badgeChartColors: Color[] = [
  {
    backgroundColor: ['rgba(0, 255, 0, 0.5)', 'rgba(255, 0, 0, 0.5)'], // Green for Accepted, Red for Refused
  },
];

 public badgeChartLegend = true;
 public badgeChartType: ChartType = 'pie'; // Change the chart type to pie
 public badgeChartPlugins = [];

 // Properties for attestation demand chart
public attestationDemandChartData: ChartDataSets[] = [];
public attestationDemandChartLabels: Label[] = [];
public attestationDemandChartOptions: ChartOptions = {
  responsive: true,
};
public attestationDemandChartColors: Color[] = [
  {
    borderColor: 'black',
    backgroundColor: ['rgba(0, 255, 0, 0.5)', 'rgba(255, 0, 0, 0.5)',], // Green for Accepted, Red for Refused
  },
];
public attestationDemandChartLegend = true;
public attestationDemandChartType: ChartType = 'pie'; // Change the chart type to bar
public attestationDemandChartPlugins = [];

 // New chart properties
 public leaveTypesChartData: ChartDataSets[] = [];
 public leaveTypesChartLabels: Label[] = [];
 public leaveTypesChartOptions: ChartOptions = {
   responsive: true,
  
 };
 public leaveTypesChartColors: Color[] = [{
  backgroundColor: []
 }];
 
 public leaveTypesChartLegend = true;
 public leaveTypesChartType: ChartType = 'pie';
 public leaveTypesChartPlugins = [];











 public questionsChartData: ChartDataSets[] = [];
 public questionsChartLabels: Label[] = [];
 public questionsChartOptions: ChartOptions = {
   responsive: true,
 };
 public questionsChartColors: Color[] = [{
   backgroundColor: []
 }];
 public questionsChartLegend = true;
 public questionsChartType: ChartType = 'bar';
 public questionsChartPlugins = [];



 
  constructor(private questionsRHService: QuestionsRHService ,private congerMaladieService : CongerMaladieService, private userService: UsersService,private demandeAttestationsService: DemandeAttestationsService,private badgeService: BadgeService,private attestationService: AttestationServiceService ,private router:Router,private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      
      this.username = this.tokenStorage.getUser().username;
      this.role = this.tokenStorage.getUser().roles;

    }

    this.loadUsers();
    this.loadAttestations();
    this.fetchBadges();
    this.loadDemandeAttestations();
    this.loadCongerMaladieList();
    this.loadQuestionsRH();

  }
  loadQuestionsRH(): void {
    // Assuming QuestionsRHService.getAllQuestionsRH() returns Observable<QuestionsRH[]>
    this.questionsRHService.getAllQuestionsRH().subscribe(
      (data: QuestionsRH[]) => {
        // Extract data for chart
        const questionCounts = this.prepareQuestionsChartData(data);
        // Set chart data
        this.questionsChartLabels = Object.keys(questionCounts);
        this.questionsChartData = [{
          data: Object.values(questionCounts),
          label: 'QuestionsRH'
        }];
        // Set chart colors (generate random colors)
        this.questionsChartColors[0].backgroundColor = this.generateRandomColors(Object.keys(questionCounts).length);
      },
      error => {
        console.error('Error fetching QuestionsRH:', error);
        // Handle error, e.g., show error message
      }
    );
  }
  prepareQuestionsChartData(data: QuestionsRH[]): { [key: string]: number } {
    // Prepare chart data (count by categories, or other relevant data)
    const questionCounts: { [key: string]: number } = {};
    data.forEach(question => {
      // Aggregate counts based on categories or other attributes
      // Example: Count questions by category
      const category = question.categories; // Adjust as per your QuestionsRH model
      questionCounts[category] = (questionCounts[category] || 0) + 1;
    });
    return questionCounts;
  }
  
  loadUsers() {
    // Set the auth token before fetching users
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');

      return;
    }
    this.userService.getAllUsers(authToken).subscribe(
      (data: User[]) => {
        this.users = data;
        console.log(this.users);
      },
      error => {
        console.log('Error fetching users:', error);
      }
    );
  }
  
  loadDemandeAttestations(): void {
    // Retrieve the authorization token from local storage
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    // Fetch demande attestations using the service
    this.demandeAttestationsService.getAllDemandeAttestations(authToken).subscribe(
      (data: DemandeAttestations[]) => {
        this.demandeAttestations = data;
        console.log(this.demandeAttestations);
        this.prepareAttestationDemandChartData(data);

      },
      error => {
        console.log('Error fetching demande attestations:', error);
      }
    );
  }
  prepareAttestationDemandChartData(data: DemandeAttestations[]): void {
    // Fetch attestations
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
        console.error('Authorization token not found');
        Swal.fire('Error!', 'Authorization token not found', 'error');
        return;
    }

   // Inside prepareAttestationDemandChartData function
this.attestationService.getAllAttestations(authToken).subscribe(
    (attestations: any[]) => {
        this.attestations = attestations;

        // Initialize an object to store demand counts per attestation
        const demandCountPerAttestation: { [key: string]: number } = {};

        // Initialize an array to store colors
        const colors: string[] = [];

        // Iterate through each attestation
        this.attestations.forEach(attestation => {
            // Filter demands based on the current attestation ID
            const demandsForAttestation = data.filter(demand => {
                // Convert attestation_id to number for comparison
                const attestationId = Number(demand.attestation_id);
                return attestationId === attestation.id;
            });
            // Count the number of demands for the current attestation
            const demandCount = demandsForAttestation.length;

            // Store the demand count for the current attestation name
            demandCountPerAttestation[attestation.name] = demandCount;

            // Generate a random color for the current attestation
            const randomColor = this.getRandomColor();
            colors.push(randomColor);
        });

        // Set chart data
        this.attestationDemandChartLabels = Object.keys(demandCountPerAttestation);
        this.attestationDemandChartData = [{
            data: Object.values(demandCountPerAttestation),
            label: 'Demand Count Per Attestation'
        }];
        this.attestationDemandChartColors = [{
            backgroundColor: colors
        }];
    },
    error => {
        console.log('Error fetching attestations:', error);
    }
);
  }

// Function to generate a random color
getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}




  
  
  
  
  
  fetchBadges(): void {
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');

      return;
    }
    this.badgeService.getAllBadges(authToken)
      .subscribe(
        data => {
         
          this.badges = data;
          this.prepareBadgeChartData(data);

          console.log("badge", this.badges);
        },
        error => {
          console.log(error);
        }
      );
  }

  prepareBadgeChartData(data: any[]): void {
    const acceptedBadges = data.filter(badge => badge.status === 'accepter');
    const refusedBadges = data.filter(badge => badge.status === 'refuser');
  
    const acceptedCount = acceptedBadges.length;
    const refusedCount = refusedBadges.length;
  
    this.badgeChartLabels = ['Accepted', 'Refused'];
    this.badgeChartData = [
      { data: [acceptedCount, refusedCount], label: 'Badges' }
    ];
  }
  
  
  loadAttestations(): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
  
    this.attestationService.getAllAttestations(authToken).subscribe(
      data => {
        this.attestations = data;
        console.log(" this.attestations" , this.attestations)
        this.prepareChartData(data);

      },
      error => {
        console.log(error);
      }
    );
  }


  prepareChartData(data: any[]): void {
    // Filter out attestations that have exist: true
    const attestationsWithPDF = data.filter(attestation => attestation.exist === true);
  
    // Assuming you want to count attestations by name
    const attestationNames = attestationsWithPDF.map(attestation => attestation.name);
    const attestationCounts = attestationNames.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  
    this.barChartLabels = Object.keys(attestationCounts);
    this.barChartData = [
      { data: Object.values(attestationCounts).map(count => count as number), label: 'Attestations with PDF' }
    ];
  }
  
  loadCongerMaladieList(): void {
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    this.congerMaladieService.getAllCongerMaladie(authToken).subscribe(
      (data: any) => {
        this.congerMaldierList = data;
        console.log(data);
        this.prepareCongerMaladieChartData(data);
        this.prepareLeaveTypesChartData(data);

      },
      (error: any) => {
        console.log('Error fetching conger maladie list:', error);
      }
    );
  }
  // prepareCongerMaladieChartData(data: any[]): void {
  //   const typesOfLeave = data.map(conger => conger.typeConger);
  //   const leaveCounts = typesOfLeave.reduce((acc, type) => {
  //     acc[type] = (acc[type] || 0) + 1;
  //     return acc;
  //   }, {} as { [key: string]: number });

  //   this.congerMaladieChartLabels = Object.keys(leaveCounts);
  //   this.congerMaladieChartData = [
  //     { data: Object.values(leaveCounts).map(count => count as number), label: 'Types of Leave' }
  //   ];

  //   this.congerMaladieChartColors[0].backgroundColor = this.generateRandomColors(Object.keys(leaveCounts).length);

  // }
  prepareCongerMaladieChartData(data: any[]): void {
    // Initialize an object to store counts for each interval
    const intervalCounts: { [key: string]: number } = {};

    // Define intervals based on date ranges
    const intervals = [
      { label: '0-7 days', start: 0, end: 7 },
      { label: '8-14 days', start: 8, end: 14 },
      { label: '15-30 days', start: 15, end: 30 },
      { label: '31+ days', start: 31, end: Infinity }
    ];

    // Iterate through each conger and calculate its duration in days
    data.forEach(conger => {
      const dateDebut = new Date(conger.dateDebut);
      const dateFin = new Date(conger.dateFin);
      const durationInDays = this.getDurationInDays(dateDebut, dateFin);

      // Find the appropriate interval for the duration
      const interval = intervals.find(interval => durationInDays >= interval.start && durationInDays <= interval.end);

      // Increment the count for the interval
      if (interval) {
        intervalCounts[interval.label] = (intervalCounts[interval.label] || 0) + 1;
      }
    });

    // Prepare chart data
    this.congerMaladieChartLabels = Object.keys(intervalCounts);
    this.congerMaladieChartData = [{
      data: Object.values(intervalCounts),
      label: 'Conger Maladie Intervals'
    }];

    // Generate random colors for each interval
    this.congerMaladieChartColors[0].backgroundColor = this.generateRandomColors(Object.keys(intervalCounts).length);
  }
  getDurationInDays(dateDebut: Date, dateFin: Date): number {
    const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  generateRandomColors(numColors: number): string[] {
    const colors: string[] = [];
    const letters = '0123456789ABCDEF';
    for (let i = 0; i < numColors; i++) {
      let color = '#';
      for (let j = 0; j < 6; j++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      colors.push(color);
    }
    return colors;
  }
  prepareLeaveTypesChartData(data: any[]): void {
    const typesOfLeave = data.map(conger => conger.typeConger);
    const leaveCounts = typesOfLeave.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  
    this.leaveTypesChartLabels = Object.keys(leaveCounts);
    this.leaveTypesChartData = [{
      data: Object.values(leaveCounts).map(count => count as number),
      label: 'Types of Leave'
    }];
  
    // Generate random colors for the chart
    this.leaveTypesChartColors[0].backgroundColor = this.generateRandomColorss(Object.keys(leaveCounts).length);
  }
  
  generateRandomColorss(numColors: number): string[] {
    const colors: string[] = [];
    const letters = '0123456789ABCDEF';
    for (let i = 0; i < numColors; i++) {
      let color = '#';
      for (let j = 0; j < 6; j++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      colors.push(color);
    }
    return colors;
  }

  
}
