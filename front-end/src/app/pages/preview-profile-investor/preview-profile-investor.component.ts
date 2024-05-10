import { Component, ElementRef, OnInit } from '@angular/core';
import { InvestorService } from '../../shared/investor-service';
import { environment } from '../../../environments/environment';
import { InvestorModel } from "../../shared/investor-model";
import { faFacebookF, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { MatchMakingService } from '../../shared/match-making-service';

interface Company {
  _id: string;
  name: string;
  amount: string;
  type: string;
  image?: string;
}

@Component({
  selector: 'app-preview-profile-investor',
  templateUrl: './preview-profile-investor.component.html',
  styleUrl: './preview-profile-investor.component.scss'
})
export class PreviewProfileInvestorComponent implements OnInit{

  private baseUrl = environment.domain;
  currentUser: InvestorModel = {};
  imageUrl: string;
  faFacebookF = faFacebookF;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faLocationDot = faLocationDot;
  userSectors: string[];
  userAmount: string;
  userType: string;
  userCompanyStages: string[];
  userStages: string[];
  companies: Company[] = [];
  companiesExist: boolean;
  matchmaking_list: any[] = [];
  userId:any;
  userExist:boolean=false;

  constructor(
    public investorService: InvestorService,
    private actRoute: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    private elementRef: ElementRef,
    private matchMakingService: MatchMakingService,
  ) { }
  
  ngOnInit(): void {
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.investorService.getUser(id).subscribe((res) => {
      this.currentUser = res;
      this.fetchImage();
      this.getSectors();
      this.getAmount();
      this.gettype();
      this.getCompanyStages();
      this.getStages();
      this.fetchcompanies();
      this.permission();
    });
  }

  permission() {
    let userId = localStorage.getItem('userId');
    this.matchMakingService.getUser(userId).subscribe((res) => {
      this.matchmaking_list = res.matchmakings_list;
      let id = this.actRoute.snapshot.paramMap.get('id');
      console.log(this.matchmaking_list.includes(id) || userId == id)
      if (this.matchmaking_list.includes(id) || userId == id) {
        this.userExist=true
      }
    })
  }

  getAmount() {
    if (this.currentUser && this.currentUser._id) {
      this.investorService.getAmount(this.currentUser._id).subscribe(
        (amount: string) => {
          this.userAmount = amount;
          console.log(this.userAmount);
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  gettype() {
    if (this.currentUser && this.currentUser._id) {
      this.investorService.gettype(this.currentUser._id).subscribe(
        (type: string) => {
          this.userType = type;
          console.log(this.userType);
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  getCompanyStages() {
    if (this.currentUser && this.currentUser._id) {
      this.investorService.getCompanyStages(this.currentUser._id).subscribe(
        (Companystages: string[]) => {
          this.userCompanyStages = Companystages;
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  getStages() {
    if (this.currentUser && this.currentUser._id) {
      this.investorService.getStages(this.currentUser._id).subscribe(
        (stages: string[]) => {
          this.userStages = stages;
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  fetchImage(): void {
    if (this.currentUser && this.currentUser._id) {
      if (this.currentUser.image_profile == null) {
        this.imageUrl = 'assets/images/3da39-no-user-image-icon-27.webp';
      } else {
        this.imageUrl = this.baseUrl + '/investor/uploads/' + this.currentUser.image_profile;
      }
    } else {
      console.error("User ID is undefined.");
    }
  }
  getSectors() {
    if (this.currentUser && this.currentUser._id) {
      this.investorService.getSectors(this.currentUser._id).subscribe(
        (sectors: string[]) => {
          this.userSectors = sectors;

        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  fetchcompanies() {
    this.companiesExist = false;
    if (this.currentUser && this.currentUser._id) {
      this.investorService.getCompanies(this.currentUser._id).subscribe(
        (companies: Company[]) => {
          this.companies = companies;
          if (this.companies.length > 0) {
            this.companiesExist = true;
          }
        },
        (error) => {
          console.log('Error retrieving companies:', error);
        }
      );
    }
  }

  getCompanyImageUrl(companyId: string): string {
    const company = this.companies.find(company => company._id === companyId);
    let companyImageUrl: string;
    if (company && company.image) {
      companyImageUrl = this.baseUrl + '/api/uploads/' + company.image;
    } else {
      companyImageUrl = "assets/images/Default_pfp.png";
    }
    return companyImageUrl;
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
