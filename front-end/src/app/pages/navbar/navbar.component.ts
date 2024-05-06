import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { AuthService } from '../../shared/auth-service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  userRole: any;
  id: any;

  constructor(private actRoute: ActivatedRoute, public authService: AuthService,) {}

  ngOnInit() {
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.userRole = localStorage.getItem('role');
  }

  profileScore(): number{
    return this.authService.profileScore;

  }

  pourcentage(): any{
    return this.authService.pourcentage;
  }

  navigateToPreviewProfile(): void {
    let previewUrl: string;

    if (this.userRole === 'entrepreneur') {
      previewUrl = `/preview-profile-entrepreneur/${this.id}`;
    } else if (this.userRole === 'investor') {
      previewUrl = `/preview-profile-investor/${this.id}`;
    } else {
      console.error('Unknown role:', this.userRole);
      return;
    }

    window.open(previewUrl, '_blank');
  }

  getMaxScore() : number{
    let role = localStorage.getItem("role")
    let number = 0;
    role=="entrepreneur"?number = 15:number = 13;
    return number;
  }
}
