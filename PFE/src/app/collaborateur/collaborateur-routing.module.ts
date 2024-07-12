import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BadgeComponent } from './badge/badge.component';
import { AttestaionsComponent } from './attestaions/attestaions.component';
import { MaladeComponent } from './malade/malade.component';
import { QuestionsRhComponent } from './questions-rh/questions-rh.component';
import { AbscencsComponent } from './abscencs/abscencs.component';
import { ProfileComponent } from './profile/profile.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [

  { path: 'dashboard', component: HomeComponent },
  { path: 'badge', component: BadgeComponent },
  { path: 'attestaions', component: AttestaionsComponent },
  { path: 'malade', component: MaladeComponent },
  { path: 'questionsRh', component: QuestionsRhComponent },
  { path: 'Abscences', component: AbscencsComponent },
  { path: 'Profile', component: ProfileComponent },
  { path: 'chat', component: ChatComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollaborateurRoutingModule { }
