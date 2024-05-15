import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../shared/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy{

  private authenticationSub: Subscription;
  userAuthenticated = false;
  id : any;
  role:any;
  profileUrl:string;

  constructor(private authService: AuthService) { }

  ngOnDestroy(): void {
    this.authenticationSub.unsubscribe();
  }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.id = localStorage.getItem('userId')
      this.role = localStorage.getItem('role')
      if(this.role=="entrepreneur")
        this.profileUrl="../Profile/"+this.id;
      else if (this.role=="investor")
        this.profileUrl="../investorProfile/"+this.id
      else if (this.role=="admin")
        this.profileUrl="../admin/"+this.id


    }
    this.userAuthenticated = this.authService.getIsAuthenticated();
    this.authenticationSub = this.authService.getAuthenticatedSub().subscribe(status => {
    this.userAuthenticated = status;
    })
  }


  logout(){
    this.authService.logout();
  }

}
