import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollaborateurRoutingModule } from './collaborateur-routing.module';
import { HomeComponent } from './home/home.component';
import { BadgeComponent } from './badge/badge.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MaladeComponent } from './malade/malade.component';
import { AttestaionsComponent } from './attestaions/attestaions.component';
import { QuestionsRhComponent } from './questions-rh/questions-rh.component';
import { ComponentComponentCollaborateur } from './component/component.component';
import { NavComponent } from './component/nav/nav.component';
import { SidbarComponent } from './component/sidbar/sidbar.component';
import { FooterComponent } from './component/footer/footer.component';
import { AbscencsComponent } from './abscencs/abscencs.component';
import { ProfileComponent } from './profile/profile.component';
import { ChatComponent } from './chat/chat.component';
import { SortByTimestampPipe } from '../sort-by-timestamp.pipe';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [SortByTimestampPipe ,HomeComponent, BadgeComponent, MaladeComponent, AttestaionsComponent, QuestionsRhComponent, ComponentComponentCollaborateur, NavComponent, SidbarComponent, FooterComponent, AbscencsComponent, ProfileComponent, ChatComponent],
  imports: [
    CommonModule,
    CollaborateurRoutingModule,
    FormsModule, // Add FormsModule here
    ChartsModule,
    ReactiveFormsModule


  ]
})
export class CollaborateurModule { }
