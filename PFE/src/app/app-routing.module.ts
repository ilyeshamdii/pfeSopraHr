import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {RegisterComponent} from './register/register.component';
import {LoginComponent} from './login/login.component';

import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {ForgetPasswordComponent} from './forget-password/forget-password.component';
import {AuthGuard} from './auth.guard';
import {ComponentComponent} from './admin/component/component.component';
import {ComponentComponentCollaborateur} from './collaborateur/component/component.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import { CollaborateurGuard } from './guard/collaborateur.guard';
import { CalenderComponent } from './calender/calender.component';

const routes: Routes = [

    {
        path: 'calender',
        component: CalenderComponent,
        canActivate: [CollaborateurGuard] // Apply AuthGuard to this route

    },
    {
        path: '',
        component: ComponentComponent,
        loadChildren: () => import ('./admin/admin.module').then((m) => m.AdminModule),
        canActivate: [AuthGuard] // Apply AuthGuard to this route
    },

    
    {
        path: 'collaborateur',
        component : ComponentComponentCollaborateur,
        loadChildren: () => import ('./collaborateur/collaborateur.module').then((m) => m.CollaborateurModule),
        canActivate: [CollaborateurGuard] // Apply AuthGuard to this route
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'resetpwd',
        component: ResetPasswordComponent
    }, {
        path: 'forgetpwd',
        component: ForgetPasswordComponent
    }, {
        path: '**',
        component: PageNotFoundComponent
    },


  

   
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
