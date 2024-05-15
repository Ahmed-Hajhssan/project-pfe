import { Component, ElementRef, OnInit } from '@angular/core';
import { MatchMakingService } from '../../shared/match-making-service';
import { environment } from '../../../environments/environment';
import { AuthModel } from '../../shared/auth-model';
import { InvestorModel } from '../../shared/investor-model';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { faLocationDot, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../shared/auth-service';
import { InvestorService } from '../../shared/investor-service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { faBell } from '@fortawesome/free-regular-svg-icons';

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
  investors: InvestorModel[] = [];
  requests_sent: any[] = [];
  requests_received: any[] = [];
  matchmaking_list: any[] = [];
  requests: any[] = [];
  id: any;
  faLocationDot = faLocationDot;
  searchForm: FormGroup;
  faMagnifyingGlass = faMagnifyingGlass;
  currentEntrepreneurPage = 1;
  currentInvestorPage = 1;
  pageSize = 5;
  faBell = faBell;


  constructor(
    public authService: AuthService,
    public investorService: InvestorService,
    private matchMakingService: MatchMakingService,
    private actRoute: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    private elementRef: ElementRef,
    public fb: FormBuilder,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.role = localStorage.getItem("role");

    if (this.role == "entrepreneur") {
      this.authService.getUser(this.id).subscribe((res) => {
        this.currentEntrepreneur = res;
        this.getUser();
        this.getInvestors(
          this.currentEntrepreneur.company_stage ? this.currentEntrepreneur.company_stage : '',
          this.currentEntrepreneur.investment_size ? this.currentEntrepreneur.investment_size : "",
          this.currentEntrepreneur.city ? this.currentEntrepreneur.city : "",
          this.currentEntrepreneur.sector ? this.currentEntrepreneur.sector : []
        );
        this.initializeForm();
      })
    } else if (this.role == "investor") {
      this.investorService.getUser(this.id).subscribe((res) => {
        this.currentInvestor = res;
        this.getUser();
        this.getEntrepreneurs(
          this.currentInvestor.company_stage ? this.currentInvestor.company_stage : [],
          this.currentInvestor.amount ? this.currentInvestor.amount : "",
          this.currentInvestor.preferred_area ? this.currentInvestor.preferred_area : "",
          this.currentInvestor.sector ? this.currentInvestor.sector : []
        );
        this.initializeForm();

      })

    }
    console.log(this.role);
  }

  toppings = new FormControl('');
  toppingList: string[] = [
    '3D Printing', 'Advanced Materials', 'Aerospace', 'Agriculture', 'AI', 'Art & Design', 'Automotive',
    'Automotive & Transport', 'Biotechnology', 'Blockchain', 'Chemistry', 'Cleantech', 'Climate', 'Construction',
    'Data & Analytics', 'Drones', 'E-commerce', 'Education', 'Electronics', 'Energy', 'Enterprise Software',
    'Fashion', 'Fintech', 'FMCG', 'Food & Beverage', 'Gaming', 'Generative Al', 'Hardware', 'Home', 'ICT', 'Industry',
    'Insurtech', 'Internet loT', 'IT', 'Legal', 'Lifestyle', 'Distribution & Logistics', 'Manufacturing', 'Marine',
    'Marketing & Advertising', 'Marketplace', 'Media & Entertainment', 'Healthcare & Medtech', 'Mining', 'Mobile',
    'Nanotechnology', 'Oil & Gas', 'Pharma', 'Real Estate', 'Recruitment', 'Retailing', 'Robotics', 'SaaS',
    'Security & Cybersecurity', 'Sharing Economy', 'Smart Cities', 'Social Networking', 'Sports', 'Telecommunications',
    'Transport & Logistics', 'Travel', 'VR & AR', 'Web3'
  ];

  companyStages = new FormControl('');
  stageList: string[] = [
    'Idea', 'Pre-seed', 'Seed', 'Early Growth', 'Growth', 'Maturity'
  ];

  getUser() {
    this.matchMakingService.getUser(this.id).subscribe((res) => {
      this.requests_sent = res.request_sent;
      this.requests_received = res.request_received;
      this.matchmaking_list = res.matchmakings_list;
      this.getRequests();
    })
  }

  getRequests() {
    let entrepreneurs: AuthModel[] = [];
    let investors: InvestorModel[] = [];
    if (this.role === "investor") {
      for (let id of this.requests_received) {
        this.authService.getUser(id).subscribe(
          (user: AuthModel) => {
            entrepreneurs.push(user);
          },
          (error: any) => {
            console.log(`Failed to retrieve user with ID ${id}`, error);
          }
        );
      }
      this.requests = entrepreneurs;
      console.log('entrepreneurs request', this.requests)
    }else{
      for (let id of this.requests_received) {
        this.investorService.getUser(id).subscribe(
          (user: InvestorModel) => {
            investors.push(user);
          },
          (error: any) => {
            console.log(`Failed to retrieve user with ID ${id}`, error);
          }
        );
      }
      this.requests = investors;
      console.log('investors request', this.requests)
    }
    
  }

  inList(id: any): boolean {
    if (this.requests_sent.includes(id) || this.matchmaking_list.includes(id)) {
      return true
    }
    else {
      return false
    }
  }

  request(receiverId: any) {
    let senderId = this.id;
    this.matchMakingService.sendRequest(senderId, receiverId).subscribe();
    setTimeout(() => {
      this.ngOnInit();
    }, 100);
  }

  acceptRequest(senderId: any) {
    let receiverId = this.id;
    this.matchMakingService.acceptRequest(senderId, receiverId).subscribe();
    setTimeout(() => {
      this.ngOnInit();
    }, 100);
    console.log('receiverid', receiverId)
  }

  declineRequest(senderId: any) {
    let receiverId = this.id;
    this.matchMakingService.declineRequest(senderId, receiverId).subscribe();
    setTimeout(() => {
      this.ngOnInit();
    }, 100);
  }

  showMore(): void {
    if (this.role === 'entrepreneur') {
      this.matchMakingService.getInvestors().subscribe({
        next: (investors: InvestorModel[]) => {
          this.investors = investors;
        },
        error: (error: any) => {
          console.error('Error fetching investors:', error);
        }
      });
    } else if (this.role === 'investor') {
      this.matchMakingService.getEntrepreneurs().subscribe({
        next: (entrepreneurs: AuthModel[]) => {
          this.entrepreneurs = entrepreneurs;
          console.log(entrepreneurs);
        },
        error: (error: any) => {
          console.error('Error fetching entrepreneurs:', error);
        }
      });
    }
  }

  get displayedEntrepreneurs(): any[] {
    const startIndex = (this.currentEntrepreneurPage - 1) * this.pageSize;
    return this.entrepreneurs.slice(startIndex, startIndex + this.pageSize);
  }

  get displayedInvestors(): any[] {
    const startIndex = (this.currentInvestorPage - 1) * this.pageSize;
    return this.investors.slice(startIndex, startIndex + this.pageSize);
  }

  get entrepreneurPages(): number[] {
    const pageCount = Math.ceil(this.entrepreneurs.length / this.pageSize);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  get investorPages(): number[] {
    const pageCount = Math.ceil(this.investors.length / this.pageSize);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }


  changePage(page: number | 'prev' | 'next', type: 'entrepreneurs' | 'investors', event: Event): void {
    if (type === 'entrepreneurs') {
      if (page === 'prev' && this.currentEntrepreneurPage > 1) {
        this.currentEntrepreneurPage--;
      } else if (page === 'next' && this.currentEntrepreneurPage < this.entrepreneurPages.length) {
        this.currentEntrepreneurPage++;
      } else if (typeof page === 'number' && page >= 1 && page <= this.entrepreneurPages.length) {
        this.currentEntrepreneurPage = page;
      }
    } else if (type === 'investors') {
      if (page === 'prev' && this.currentInvestorPage > 1) {
        this.currentInvestorPage--;
      } else if (page === 'next' && this.currentInvestorPage < this.investorPages.length) {
        this.currentInvestorPage++;
      } else if (typeof page === 'number' && page >= 1 && page <= this.investorPages.length) {
        this.currentInvestorPage = page;
      }
    }
    event.preventDefault();
    event.stopPropagation();

  }

  getEntrepreneurs(companyStages: string[], investmentAmount: string, city: string, sectors: string[]) {
    let mmScore = 0;
    let criteria: string[] = [];
    let userCompanyStage = companyStages;
    let userAmount = investmentAmount;
    let userCity = city.toUpperCase();
    let userSectors = sectors;
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

  getInvestors(companyStage: string, investmentAmount: string, city: string, sectors: string[]) {
    let mmScore = 0;
    let criteria: string[] = [];
    let userCompanyStage = companyStage;
    let userAmount = investmentAmount;
    let userCity = city.toUpperCase();
    let userSectors = sectors
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
          if (investor.preferred_area && investor.preferred_area.toUpperCase() == userCity) {
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

  onSubmit() {
    const formValues = this.searchForm.value;
    // Access individual form controls
    const companyStages = formValues.companyStages;
    const investmentAmount = formValues.investment_amount;
    const city = formValues.city;
    const sectors = formValues.sector;
    if (this.role === "investor") {
      this.getEntrepreneurs(companyStages, investmentAmount, city, sectors);
    } else if (this.role === "entrepreneur") {
      this.getInvestors(companyStages, investmentAmount, city, sectors);
    }
  }

  initializeForm() {
    if (this.role === "investor")
      this.searchForm = this.fb.group({
        companyStages: [this.currentInvestor.company_stage],
        investment_amount: [this.currentInvestor.amount],
        city: [this.currentInvestor.preferred_area],
        sector: [this.currentInvestor.sector],
      });
    else {
      this.searchForm = this.fb.group({
        companyStages: [this.currentEntrepreneur.company_stage],
        investment_amount: [this.currentEntrepreneur.investment_size],
        city: [this.currentEntrepreneur.city],
        sector: [this.currentEntrepreneur.sector],
      });
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



