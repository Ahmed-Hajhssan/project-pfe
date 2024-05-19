import { Component, OnInit, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
import { AuthService } from '../../shared/auth-service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {

  private authenticationSub: Subscription;
  userAuthenticated = false;
  id:any;
  userRole: any;

  constructor(private renderer: Renderer2, private authService: AuthService, private actRoute: ActivatedRoute) { }


  ngOnInit() {
    //this.id = localStorage.getItem('userId');
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.userRole = localStorage.getItem('role');
    this.expand();
    this.fullHeight();
    this.userAuthenticated = this.authService.getIsAuthenticated();
    this.authenticationSub = this.authService.getAuthenticatedSub().subscribe(status => {
    this.userAuthenticated = status;

    })
  }

  ngOnDestroy(): void {
    this.authenticationSub.unsubscribe();
  }

  navigateToFeed(): string{
    let url = `/feed/${this.id}`;
    return url
  }

  navigateToChat(): string{
    let url = `/chat/${this.id}`;
    return url
  }

  getMatchmakingUrl(): string{
    let url = `/matchmaking/${this.id}`;
    return url
  }

  navigateToProfile(): string {
    let previewUrl: string;

    if (this.userRole === 'entrepreneur') {
      previewUrl = `/Profile/${this.id}`;
    } else if (this.userRole === 'investor') {
      previewUrl = `/investorProfile/${this.id}`;
    }else{
      previewUrl =''
    }
    return previewUrl;
  }


  logout(){
    this.authService.logout();
  }

  ngAfterViewInit(): void {
    this.setupSidebarCollapse();
    this.setupHamBurgerClick();
  }


  fullHeight(): void {
    const fullHeightElements = document.querySelectorAll('.js-fullheight');
    fullHeightElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.height = window.innerHeight + 'px';
    });

    this.renderer.listen(window, 'resize', () => {
      fullHeightElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.height = window.innerHeight + 'px';
      });
    });
  }

  setupSidebarCollapse(): void {
    // Add any logic to setup the sidebar collapse behavior
  }

  setupHamBurgerClick(): void {
    const hamBurger: HTMLElement | null = document.querySelector(".toggle-btn");

    if (hamBurger) {
      this.renderer.listen(hamBurger, "click", () => {
        const sidebar: HTMLElement | null = document.querySelector("#sidebar");
        const content: HTMLElement | null = document.querySelector("#content");
        if (sidebar) {
          sidebar.classList.toggle("expand");
          content?.classList.toggle("expand");
        }
      });
    }
  }
  expand(){
    const sidebar: HTMLElement | null = document.querySelector("#sidebar");
    const content: HTMLElement | null = document.querySelector("#content");
      if (sidebar) {
          sidebar.classList.toggle("expand");
          content?.classList.toggle("expand");
      }
  }
}