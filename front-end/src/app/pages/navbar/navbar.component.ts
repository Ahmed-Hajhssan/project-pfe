import { Component } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(private actRoute: ActivatedRoute) { }

  navigateToPreviewProfile(): void {
    let id = this.actRoute.snapshot.paramMap.get('id');
    const previewUrl = `/Profile/preview-profile/${id}`;
    window.open(previewUrl, '_blank');
  }

}
