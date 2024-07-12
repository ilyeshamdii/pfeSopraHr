import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DemandeAttestations } from 'src/app/Models/DemandeAttestations';
import { Badge } from 'src/app/Models/badge';
import { BadgeService } from 'src/app/Service/BadgeService/BadgeService/badge-service.service';
import { DemandeAttestationsService } from 'src/app/Service/DemandeAttestations/demande-attestations.service';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { QuestionsRH } from 'src/app/Models/QuestionsRH';
import { QuestionsRHService } from 'src/app/Service/QuestionsRH/questions-rh.service';

@Component({ selector: 'app-home', templateUrl: './home.component.html', styleUrls: ['./home.component.css'] })
export class HomeComponent implements OnInit {
    roles: string[] = [];
    fileName !: string; // Add fileName property to store the image file name
    userId !: number; // Add userId property to store the user's ID
    image !: string; // Add image property to store the image URL
    username: any;
    elementRef: any;
    isUICollapsed: boolean = false;
    inProgressCount: number = 0;
    acceptedCount: number = 0;
    refusedCount: number = 0;
    acceptedCountBadge: number = 0;
    refusedCountBadge: number = 0;
    inProgressCountBadge: number = 0;
    demandesAttestations: DemandeAttestations[] = [];
    enCoursCount: number = 0;
    accepterCount: number = 0;
    refuserCount: number = 0;
    messageCount: number = 0;
    totalMessages !: number;
    public badgeChartData: ChartDataSets[] = [];
    public badgeChartLabels: Label[] = [];
    public badgeChartOptions: ChartOptions = {
        responsive: true
    };
    public badgeChartColors: Color[] = [{
        backgroundColor: [
            'rgba(0, 255, 0, 0.5)', 'rgba(255, 0, 0, 0.5)'
        ], // Green for Accepted, Red for Refused
    },];

    public badgeChartLegend = true;
    public badgeChartType: ChartType = 'pie'; // Change the chart type to pie
    public badgeChartPlugins = [];



    public requestChartData: ChartDataSets[] = [];
    public requestChartLabels: Label[] = [];
    public requestChartOptions: ChartOptions = {
        responsive: true
    };
    public requestChartColors: Color[] = [{
        backgroundColor: [
            'rgba(0, 123, 255, 0.5)', // Blue for In Progress
            'rgba(40, 167, 69, 0.5)', // Green for Accepted
            'rgba(220, 53, 69, 0.5)'  // Red for Refused
        ],
    }];
    public requestChartLegend = true;
    public requestChartType: ChartType = 'doughnut';
    public requestChartPlugins = [];


    public demandeChartData: ChartDataSets[] = [];
    public demandeChartLabels: Label[] = [];
    public demandeChartOptions: ChartOptions = {
        responsive: true,
        scales: { xAxes: [{}], yAxes: [{}] },
        plugins: {
            datalabels: {
                anchor: 'end',
                align: 'end',
            }
        }
    };
    public demandeChartColors: Color[] = [{
        backgroundColor: [
            this.generateRandomColor(),
            this.generateRandomColor(),
            this.generateRandomColor()
        ],
        borderColor: [
            this.generateRandomColor(),
            this.generateRandomColor(),
            this.generateRandomColor()
        ]
    }];
    public demandeChartLegend = true;
    public demandeChartType: ChartType = 'bar';
    public demandeChartPlugins = [];


    public dailyMessageCounts: number[] = [];
    public messageDates: Label[] = [];
    public lineChartData: ChartDataSets[] = []; // Chart data
    public lineChartLabels: Label[] = []; // Chart labels
  
    public lineChartOptions: ChartOptions = {
      responsive: true,
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'day' // Display data by day
          },
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Message Count'
          }
        }]
      },
      plugins: {
        datalabels: {
          display: false
        }
      }
    };
    public lineChartColors = [{
      borderColor: 'rgba(77, 166, 255, 1)',
      backgroundColor: 'rgba(77, 166, 255, 0.2)',
    }];
    public lineChartLegend = true;
    public lineChartType: ChartType = 'line';
    public lineChartPlugins = [];




    userQuestions: QuestionsRH[] = [];
  
    // Chart properties
    questionCountData: ChartDataSets[] = [{ data: [], label: 'Questions Received' }];
    questionCountLabels: Label[] = [];
    chartOptions: ChartOptions = {
      responsive: true,
      scales: { 
        xAxes: [{ 
          ticks: { 
            autoSkip: true, 
            maxTicksLimit: 10 
          } 
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    };
    chartType: ChartType = 'bar';
    chartLegend = true;
    chartPlugins = [];


    constructor(     private questionsRHService: QuestionsRHService,
        public websocketChatService: WebsocketChatService, private demandeAttestationsService: DemandeAttestationsService, private badgeService: BadgeService, private http: HttpClient, private router: Router, private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

    ngOnInit(): void {
        this.loadScriptsAndStyles();
        if (this.tokenStorage.getToken()) {
            this.roles = this.tokenStorage.getUser().roles;
            this.userId = this.tokenStorage.getUser().id;
            this.fileName = this.tokenStorage.getUser().photos;
            this.username = this.tokenStorage.getUser().username;
            this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

        }
        this.fetchRequestCounts();
        this.fetchBadgesByUserId(this.userId);
        this.loadDemandeAttestations();
        this.loadMessages();
        this.fetchQuestionsRH();

    }

    fetchQuestionsRH(): void {
        const authToken = this.tokenStorage.getToken();
    
        if (!authToken) {
          console.error('Authorization token not found');
          Swal.fire('Error!', 'Authorization token not found', 'error');
          return;
        }
    
        this.questionsRHService.getQuestionsRHById(this.userId).subscribe(
          (data: QuestionsRH[]) => {
            this.userQuestions = data;
            this.updateChartData();
          },
          (error) => {
            console.error('Error fetching user questions:', error);
          }
        );
      }
      updateChartData(): void {
        // Reset data arrays
        this.questionCountLabels = [];
        const questionCounts: number[] = [];
    
        // Calculate counts for each category
        this.userQuestions.forEach(question => {
          const category = question.categories; // Assuming 'categories' is the field for category
          if (!this.questionCountLabels.includes(category)) {
            this.questionCountLabels.push(category);
            questionCounts.push(1);
          } else {
            const index = this.questionCountLabels.indexOf(category);
            questionCounts[index]++;
          }
        });
    
        // Update chart data
        this.questionCountData = [{ data: questionCounts, label: 'Questions Received' }];
      }
    
    loadMessages(): void {
        const userId = this.tokenStorage.getUser().id;
        this.websocketChatService.getPersistedMessages(userId).subscribe((messages) => {
            console.log("Received messages:", messages);
            // Calculate daily message counts
            this.messageCount = messages.length; // Count the number of messages
            this.totalMessages = 100; // Set the total number of messages for the progress bar
        });
    }



    calculateProgress(current: number, total: number): string {
        return `${(current / total) * 100
            }%`;
    }
    loadDemandeAttestations(): void {
        const authToken = this.tokenStorage.getToken();

        if (!authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');
            return;
        }

        this.demandeAttestationsService.getAllDemandeAttestations(authToken).subscribe(data => { // Filter the data by user_id

            this.demandesAttestations = data.filter(demande => demande.user_id == this.userId);

            // Compute counts for each status
            this.enCoursCount = this.demandesAttestations.filter(demande => demande.isApproved === 'en cours').length;
            this.accepterCount = this.demandesAttestations.filter(demande => demande.isApproved === 'accepted').length;
            this.refuserCount = this.demandesAttestations.filter(demande => demande.isApproved === 'refused').length;

            this.prepareDemandeChartData();

        }, error => {
            console.error('Error fetching demande attestations:', error);
            // Handle error
        });
    }
    prepareDemandeChartData(): void {
        this.demandeChartLabels = ['En Cours', 'Accepted', 'Refused'];
        this.demandeChartData = [{
            data: [this.enCoursCount, this.accepterCount, this.refuserCount],
            label: 'Demandes',
            backgroundColor: [
                this.generateRandomColor(),
                this.generateRandomColor(),
                this.generateRandomColor()
            ],
            borderColor: [
                this.generateRandomColor(),
                this.generateRandomColor(),
                this.generateRandomColor()
            ],
            borderWidth: 1
        }];
    }
    generateRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    fetchBadgesByUserId(userId: number): void {
        const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
        if (!authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');

            return;
        }
        this.badgeService.getBadgesByUserIdTotale(userId, authToken).subscribe((data: Badge[]) => { // this.badges = data;
            console.log(data)
            this.prepareBadgeChartData(data);

            let acceptedCountBadge = 0;
            let refusedCountBadge = 0;
            let inProgressCountBadge = 0;
            data.forEach(badge => {
                if (badge.status === 'accepter') {
                    acceptedCountBadge++;
                } else if (badge.status === 'refuser') {
                    refusedCountBadge++;
                } else if (badge.status === 'en cours') {
                    inProgressCountBadge++;
                }
            });
            this.acceptedCountBadge = acceptedCountBadge;
            this.refusedCountBadge = refusedCountBadge;
            this.inProgressCountBadge = inProgressCountBadge;
        }, error => {
            console.log(error); // Handle error
        });
    }
    prepareBadgeChartData(data: Badge[]): void {
        const acceptedBadges = data.filter(badge => badge.status === 'accepter');
        const refusedBadges = data.filter(badge => badge.status === 'refuser');
        const InprogressBadges = data.filter(badge => badge.status === 'en cours');

        const acceptedCount = acceptedBadges.length;
        const InprogressCount = InprogressBadges.length;

        const refusedCount = refusedBadges.length;
        this.badgeChartLabels = ['Accepted', 'Refused', 'In Progress'];
        this.badgeChartData = [{
            data: [
                acceptedCount, refusedCount, InprogressCount
            ],
            label: 'Badges'
        }];
    }
    fetchRequestCounts(): void {
        if (!this.userId) {
            console.error('User ID not found.');
            return;
        }

        this.http.get<any>(`/api/CongerMaladie/count/${this.userId
            }`).subscribe(response => {
                this.inProgressCount = response.inProgress;
                this.acceptedCount = response.accepted;
                this.refusedCount = response.refused;
                this.prepareRequestChartData();

            }, error => {
                console.error('Error fetching request counts:', error);
            });
    }
    prepareRequestChartData(): void {
        this.requestChartLabels = ['In Progress', 'Accepted', 'Refused'];
        this.requestChartData = [{
            data: [this.inProgressCount, this.acceptedCount, this.refusedCount],
            label: 'Requests'
        }];
    }
    getImageUrl(): string { // Assuming your backend endpoint for retrieving images is '/api/images/'
        return `http://localhost:8080/api/auth/images/${this.userId
            }/${this.fileName
            }`;
    }
    loadScriptsAndStyles(): void {
        const SCRIPT_PATH_LIST = [
            'assets/frontoffice/vendors/js/vendor.bundle.base.js',
            'assets/frontoffice/vendors/chart.js/Chart.min.js',
            'assets/frontoffice/vendors/datatables.net/jquery.dataTables.js',
            'assets/frontoffice/vendors/datatables.net-bs4/dataTables.bootstrap4.js',
            'assets/frontoffice/js/dataTables.select.min.js',
            'assets/frontoffice/js/off-canvas.js',
            'assets/frontoffice/js/hoverable-collapse.js',
            'assets/frontoffice/js/template.js',
            'assets/frontoffice/js/settings.js',
            'assets/frontoffice/js/todolist.js',
            'assets/frontoffice/js/dashboard.js',
            'assets/frontoffice/js/Chart.roundedBarCharts.js',
            'https://code.jquery.com/jquery-3.6.0.min.js'
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
        this.scriptStyleLoaderService.loadScripts(SCRIPT_PATH_LIST),
            this.scriptStyleLoaderService.loadStyles(STYLE_PATH_LIST)
        // Show the loader

    }


    logout(): void {
        this.tokenStorage.signOut(); // Clear token storage
        this.router.navigate(['/login']); // Redirect to login page
    }


    toggleUICollapse() {
        this.isUICollapsed = !this.isUICollapsed;
    }


}
