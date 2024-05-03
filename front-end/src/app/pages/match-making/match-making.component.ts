import { Component, ElementRef, OnInit } from '@angular/core';
import { MatchMakingService } from '../../shared/match-making-service';
import { environment } from '../../../environments/environment';
import { AuthModel } from '../../shared/auth-model';
import { InvestorModel } from '../../shared/investor-model';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-match-making',
  templateUrl: './match-making.component.html',
  styleUrl: './match-making.component.scss'
})
export class MatchMakingComponent implements OnInit {

  private baseUrl = environment.domain;
  role: any;
  entrepreneurs: AuthModel[] = [];
  investors: InvestorModel[] = [];
  id:any
  faLocationDot = faLocationDot;

  constructor(
    private matchMakingService: MatchMakingService, 
    private actRoute: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.role = localStorage.getItem("role");
    if (this.role == "entrepreneur") {
      this.getInvestors();
    } else if (this.role == "investor") {
      this.getEntrepreneurs();
    }
    console.log(this.role);
  }

  getEntrepreneurs() {
    this.matchMakingService.getEntrepreneurs().subscribe(
      (entrepreneurs: AuthModel[]) => {
        this.entrepreneurs = entrepreneurs;
      },
      (error) => {
        console.log('Error retrieving entrepreneurs:', error);
      }
    );
  }

  getInvestors() {
    this.matchMakingService.getInvestors().subscribe(
      (investors: InvestorModel[]) => {
        this.investors = investors;
      },
      (error) => {
        console.log('Error retrieving investors:', error);
      }
    );
  }

  navigateToPreviewProfile(id : any): void {
    let previewUrl: string;

    if (this.role === 'investor') {
      previewUrl = `/preview-profile-entrepreneur/${id}`;
    } else if (this.role === 'entrepreneur') {
      previewUrl = `/preview-profile-investor/${id}`;
    } else {
      console.error('Unknown role:', this.role);
      return;
    }

    window.open(previewUrl, '_blank');
  }

  smoothScroll(target: string) {
    const targetElement = this.elementRef.nativeElement.querySelector(target);
    if (targetElement) {
      const yOffset = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offset = 80; 
      this.viewportScroller.scrollToPosition([0, yOffset - offset]);
    }
  }
}



