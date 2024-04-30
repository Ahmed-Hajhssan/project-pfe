import { Component, ElementRef, OnInit } from '@angular/core';
import { InvestorService } from '../../shared/investor-service';
import { environment } from '../../../environments/environment';
import { InvestorModel } from "../../shared/investor-model";
import { faFacebookF, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';

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

  constructor(
    public investorService: InvestorService,
    private actRoute: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    private elementRef: ElementRef,
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
    });
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
        this.imageUrl = 'assets/images/placeholder.png';
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
  smoothScroll(target: string) {
    const targetElement = this.elementRef.nativeElement.querySelector(target);
    if (targetElement) {
      const yOffset = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offset = 80; 
      this.viewportScroller.scrollToPosition([0, yOffset - offset]);
    }
  }
}
