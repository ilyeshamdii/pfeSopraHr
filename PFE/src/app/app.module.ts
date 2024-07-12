import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';

import { authInterceptorProviders } from './_helpers/auth.interceptor';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AdminModule } from './admin/admin.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CollaborateurModule } from './collaborateur/collaborateur.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction';
import { CalenderComponent } from './calender/calender.component';
import listPlugin from '@fullcalendar/list/main.js';
import timeGridPlugin from '@fullcalendar/timegrid/main.js';
import { SortByTimestampPipe } from './sort-by-timestamp.pipe';
import { TruncatePipe } from './truncate.pipe';
import { SortByTimes2Pipe } from './sort-by-times2.pipe';

FullCalendarModule.registerPlugins([
  // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  listPlugin,
  timeGridPlugin
]);
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,

    ForgetPasswordComponent,
    ResetPasswordComponent,
    PageNotFoundComponent,
    CalenderComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AdminModule,
    CollaborateurModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
  
    BrowserModule,
    FullCalendarModule

  ],
  providers: [authInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
