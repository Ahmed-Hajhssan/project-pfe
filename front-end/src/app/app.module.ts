import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ResetComponent } from './pages/reset/reset.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BackgroundimageComponent } from './backgroundimage/backgroundimage.component';
import { Register2Component } from './pages/register-2/register-2.component';
import { ProfileComponent } from './pages/profile/profile.component';
import {TabsModule} from 'ngx-bootstrap/tabs';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthInterceptor } from './shared/auth-interceptor';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { PreviewProfileComponent } from './pages/preview-profile/preview-profile.component';
import { InvestorProfileComponent } from './pages/investor-profile/investor-profile.component';
import { PreviewProfileInvestorComponent } from './pages/preview-profile-investor/preview-profile-investor.component';
import { MatchMakingComponent } from './pages/match-making/match-making.component';
import { MatchmakingRequestsComponent } from './pages/matchmaking-requests/matchmaking-requests.component';
import { ChatComponent } from './pages/chat/chat.component';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ResetComponent,
    ForgetPasswordComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    BackgroundimageComponent,
    Register2Component,
    ProfileComponent,
    SidebarComponent,
    NavbarComponent,
    PreviewProfileComponent,
    InvestorProfileComponent,
    PreviewProfileInvestorComponent,
    MatchMakingComponent,
    MatchmakingRequestsComponent,
    ChatComponent,
    

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TabsModule.forRoot(),
    FontAwesomeModule,
    NgxDropzoneModule,
    BrowserAnimationsModule,
    MatIconModule,
    MdbCollapseModule,
    MatFormFieldModule, 
    MatSelectModule,
    MatSidenavModule,
    MatButtonModule,
    NgbDropdownModule,
    NgbModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
