import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { InvestorProfileComponent } from './pages/investor-profile/investor-profile.component';
import { RouteGuard } from './shared/route-guard';
import { PreviewProfileComponent } from './pages/preview-profile/preview-profile.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
import { ResetComponent } from './pages/reset/reset.component';
import { PreviewProfileInvestorComponent } from './pages/preview-profile-investor/preview-profile-investor.component';
import { MatchMakingComponent } from './pages/match-making/match-making.component';
import { ChatComponent } from './pages/chat/chat.component';

const routes: Routes = [
  {path:'login', component:LoginComponent},
  {path:'sign-Up', component:RegisterComponent},
  {path:'Profile/:id', component:ProfileComponent, canActivate:[RouteGuard]},
  {path:'investorProfile/:id', component:InvestorProfileComponent, canActivate:[RouteGuard]},
  {path:'preview-profile-entrepreneur/:id', component:PreviewProfileComponent},
  {path:'preview-profile-investor/:id', component:PreviewProfileInvestorComponent},
  {path:'forget-password', component:ForgetPasswordComponent},
  {path:'reset/:token', component:ResetComponent},
  {path:'matchmaking/:id', component:MatchMakingComponent, canActivate:[RouteGuard]},
  {path:'messagerie', component: ChatComponent, canActivate:[RouteGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [RouteGuard]
})
export class AppRoutingModule { }
