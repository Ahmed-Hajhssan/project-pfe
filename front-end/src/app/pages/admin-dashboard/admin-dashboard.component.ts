import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../shared/admin-service';
import { InvestorModel } from '../../shared/investor-model';
import { AuthModel } from '../../shared/auth-model';
import { MatchMakingService } from '../../shared/match-making-service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit{

  investors: InvestorModel[] = [];
  entrepreneurs: AuthModel[] = [];
  matchmakings:number;
  chats:number;
  

  constructor(
    public adminService: AdminService,
    public matchmakingService: MatchMakingService,
    private actRoute: ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.getInvestors();
    this.getEntrepreneurs();
    this.countChats();
    this.countMatchmaking()
  }

  getInvestors(): void {
    this.adminService.getInvestors()
      .subscribe(
        investors => this.investors = investors,
        error => console.error(error)
      );
  }

  getEntrepreneurs(): void {
    this.adminService.getEntrepreneurs()
      .subscribe(
        entrepreneurs => this.entrepreneurs = entrepreneurs,
        error => console.error(error)
      );
  }


  countChats(){
    this.matchmakingService.countChats()
      .subscribe((res)=>{
        this.chats = res;
    });
  }

  countMatchmaking(){
    this.matchmakingService.countMatchmakings()
      .subscribe((res)=>{
        this.matchmakings = res;
    });
  }
}