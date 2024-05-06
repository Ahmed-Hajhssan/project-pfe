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
  searchForm: FormGroup;
  faMagnifyingGlass = faMagnifyingGlass;

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

        this.getInvestors(         
          this.currentEntrepreneur.company_stage?this.currentEntrepreneur.company_stage:'',
          this.currentEntrepreneur.investment_size?this.currentEntrepreneur.investment_size:"",
          this.currentEntrepreneur.city?this.currentEntrepreneur.city:"",
          this.currentEntrepreneur.sector?this.currentEntrepreneur.sector:[]
        );
        this.initializeForm();
      })
    } else if (this.role == "investor") {
      this.investorService.getUser(this.id).subscribe((res) => {
        this.currentInvestor = res;
          this.getEntrepreneurs(
            this.currentInvestor.company_stage?this.currentInvestor.company_stage:[],
            this.currentInvestor.amount?this.currentInvestor.amount:"",
            this.currentInvestor.preferred_area?this.currentInvestor.preferred_area:"",
            this.currentInvestor.sector?this.currentInvestor.sector:[]
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
    if (this.role==="investor") {
      this.getEntrepreneurs(companyStages, investmentAmount, city, sectors);
    } else if (this.role==="entrepreneur"){
      this.getInvestors(companyStages, investmentAmount, city, sectors);
    } 
  }

  initializeForm() {
    if(this.role==="investor")
    this.searchForm = this.fb.group({
      companyStages: [this.currentInvestor.company_stage],
      investment_amount: [this.currentInvestor.amount],
      city: [this.currentInvestor.preferred_area],
      sector: [this.currentInvestor.sector],
    });
    else{
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



