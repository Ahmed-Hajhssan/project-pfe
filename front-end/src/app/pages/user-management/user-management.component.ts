import { Component, OnInit } from '@angular/core';
import { faTrashCan, faPenToSquare, } from '@fortawesome/free-regular-svg-icons';
import { AuthModel } from '../../shared/auth-model';
import { AdminService } from '../../shared/admin-service';
import { InvestorModel } from '../../shared/investor-model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit{
  faTrashCan = faTrashCan;
  faPenToSquare = faPenToSquare;
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
