import { Component, ElementRef, OnInit } from '@angular/core';
import { MatchMakingService } from '../../shared/match-making-service';
import { environment } from '../../../environments/environment';
import { AuthModel } from '../../shared/auth-model';
import { InvestorModel } from '../../shared/investor-model';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../shared/auth-service';
import { InvestorService } from '../../shared/investor-service';

@Component({
  selector: 'app-match-making',
  templateUrl: './match-making.component.html',
  styleUrl: './match-making.component.scss'
})
export class MatchMakingComponent implements OnInit {

  private baseUrl = environment.domain;
  role: any;
  currentEntrepreneur: AuthModel = {};
  currentInvestor: InvestorModel = {};
  entrepreneurs: AuthModel[] = [];
  investors: InvestorModel[] = []
  id: any
  faLocationDot = faLocationDot;

  constructor(
    public authService: AuthService,
    public investorService: InvestorService,
    private matchMakingService: MatchMakingService,
    private actRoute: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.role = localStorage.getItem("role");
    if (this.role == "entrepreneur") {
      this.authService.getUser(this.id).subscribe((res) => {
        this.currentEntrepreneur = res;
        this.getInvestors();
      })
    } else if (this.role == "investor") {
      this.investorService.getUser(this.id).subscribe((res) => {
        this.currentInvestor = res;
        this.getEntrepreneurs();
      })

    }
    console.log(this.role);
  }



  getEntrepreneurs() {
    let mmScore = 0;
    let criteria: string[] = [];
    let userCompanyStage = this.currentInvestor.company_stage;
    let userAmount = this.currentInvestor.amount;
    let userCity = this.currentInvestor.city?.toUpperCase();
    let userSectors = this.currentInvestor.sector;
    this.matchMakingService.getEntrepreneurs().subscribe(
      (entrepreneurs: AuthModel[]) => {
        entrepreneurs.forEach((entrepreneur: AuthModel) => {
          if (entrepreneur.company_stage && userCompanyStage && userCompanyStage.includes(entrepreneur.company_stage as string)) {
            mmScore++;
            criteria.push(entrepreneur.company_stage);
          }
          if (entrepreneur.investment_size && entrepreneur.investment_size == userAmount) {
            mmScore++;
            criteria.push(userAmount);
          }
          if (entrepreneur.city && entrepreneur.city.toUpperCase() == userCity) {
            mmScore++;
            criteria.push(userCity);
          }
          if (entrepreneur.sector && userSectors) {
            let commonSectors = entrepreneur.sector.filter(element => userSectors?.includes(element));
            if (commonSectors.length > 0) {
              mmScore += commonSectors.length;
              criteria.push(...commonSectors);
            }
          }
          entrepreneur.score = mmScore;
          entrepreneur.criteria = criteria;
          mmScore = 0;
          criteria = []
        })
        entrepreneurs = entrepreneurs.filter(entrepreneur => entrepreneur.score && entrepreneur.score > 0);
        entrepreneurs.sort((a, b) => a.score && b.score ? b.score - a.score : 0);
        console.log(entrepreneurs);
        this.entrepreneurs = entrepreneurs;
      },
      (error) => {
        console.log('Error retrieving entrepreneurs:', error);
      }
    );
  }

  getInvestors() {
    let mmScore = 0;
    let criteria: string[] = [];
    let userCompanyStage = this.currentEntrepreneur.company_stage;
    let userAmount = this.currentEntrepreneur.investment_size;
    let userCity = this.currentEntrepreneur.city?.toUpperCase();
    let userSectors = this.currentEntrepreneur.sector;
    this.matchMakingService.getInvestors().subscribe(
      (investors: InvestorModel[]) => {
        investors.forEach((investor: InvestorModel) => {
          if (investor.company_stage && userCompanyStage && investor.company_stage.includes(userCompanyStage as string)) {
            mmScore++;
            criteria.push(userCompanyStage);
          }
          if (investor.amount && investor.amount == userAmount) {
            mmScore++;
            criteria.push(userAmount);
          }
          if (investor.city && investor.city.toUpperCase() == userCity) {
            mmScore++;
            criteria.push(userCity);
          }
          if (investor.sector && userSectors) {
            let commonSectors = investor.sector.filter(element => userSectors?.includes(element));
            if (commonSectors.length > 0) {
              mmScore += commonSectors.length;
              criteria.push(...commonSectors);
            }
          }
          investor.score = mmScore;
          investor.criteria = criteria;
          mmScore = 0;
          criteria = []
        })
        investors = investors.filter(investor => investor.score && investor.score > 0);
        investors.sort((a, b) => a.score && b.score ? b.score - a.score : 0);
        console.log(investors);
        this.investors = investors;
      },
      (error) => {
        console.log('Error retrieving investors:', error);
      }
    );
  }

  navigateToPreviewProfile(id: any): void {
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



