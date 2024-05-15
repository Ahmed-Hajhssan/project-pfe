import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../../shared/auth-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent implements OnInit, AfterViewInit {

  id:any;

  constructor(private renderer: Renderer2,  private authService: AuthService, private actRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.expand();
    this.fullHeight();
  }

  navigateToDashboard(): string {
    let dashboardUrl: string
    dashboardUrl = `/admin/${this.id}`;
    
    return dashboardUrl;
  }

  navigateToUsersManagement(): string {
    let ManagementUrl: string
    ManagementUrl = `/users-management/${this.id}`;
    
    return ManagementUrl;
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