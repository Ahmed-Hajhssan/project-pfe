import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  userRole: any;
  id: any;

  constructor(private actRoute: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.userRole = localStorage.getItem('role');
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
}
