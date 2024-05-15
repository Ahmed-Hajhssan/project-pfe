import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../shared/admin-service';
import { InvestorModel } from '../../shared/investor-model';
import { AuthModel } from '../../shared/auth-model';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit{

  investors: InvestorModel[] = [];
  entrepreneurs: AuthModel[] = [];
  

  constructor(
    public adminService: AdminService,
  ){}

  ngOnInit(): void {
    this.getInvestors();
    this.getEntrepreneurs();
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

}