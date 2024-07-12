import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BadgeComponent } from './badge/badge.component';
import { AttestationsComponent } from './attestations/attestations.component';
import { AbsencesComponent } from './absences/absences.component';
import { QuestionsRhComponent } from './questions-rh/questions-rh.component';
import { UsersComponent } from './users/users.component';
import { DemandeAttestationsComponent } from './demande-attestations/demande-attestations.component';
import { NotificationComponent } from './notification/notification.component';
import { ChatComponent } from './chat/chat/chat.component';
import { ChatManagerComponent } from './chat-manager/chat-manager.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [

  {path: '', redirectTo: '/dashboard', pathMatch: 'full' , data: {title: 'Administrateur'}},
  { path: 'dashboard', component: DashboardComponent , data: {title: 'Administrateur'}},

  { path: 'badge', component: BadgeComponent , data: {title: 'Administrateur'}},
  { path: 'attestations', component: AttestationsComponent , data: {title: 'Administrateur'}},
  { path: 'absences', component: AbsencesComponent , data: {title: 'Administrateur'}},
  { path: 'QuestionsRh', component: QuestionsRhComponent , data: {title: 'Administrateur'}},
  { path: 'demandeattestations', component: DemandeAttestationsComponent , data: {title: 'Administrateur'}},
  { path: 'chat', component: ChatComponent , data: {title: 'Administrateur'}},
  { path: 'ChatManager', component: ChatManagerComponent , data: {title: 'Administrateur'}},

  { path: 'users', component: UsersComponent , data: {title: 'Administrateur'}},
  { path: 'profile', component: ProfileComponent , data: {title: 'Administrateur'}},

  { path: 'Notification', component: NotificationComponent , data: {title: 'Administrateur'}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
