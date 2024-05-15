import { Component, OnInit } from '@angular/core';
import { faTrashCan, faPenToSquare, } from '@fortawesome/free-regular-svg-icons';
import { AuthModel } from '../../shared/auth-model';
import { AdminService } from '../../shared/admin-service';
import { InvestorModel } from '../../shared/investor-model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  faTrashCan = faTrashCan;
  faPenToSquare = faPenToSquare;
  investors: InvestorModel[] = [];
  entrepreneurs: AuthModel[] = [];
  id: any;
  userId: any;
  status: boolean;
  statuses: { id: string, active: boolean }[];
  isChecked: boolean[];


  constructor(
    public adminService: AdminService,
    private actRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.id = this.actRoute.snapshot.paramMap.get('id');
    console.log('adminId', this.id)
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

  updateStatus(userId: any, event: any): void {
    const isChecked = event.target?.checked;
    if (isChecked !== undefined) {
      let body = {
        active: !isChecked
      };
      this.adminService.updateUser(userId, body).subscribe({
        complete: () => {
          console.log('Content updated successfully!');
        },
        error: (e) => {
          console.log(e);
        }
      });
    }
  }

  getAllStatuses(): void {
    this.adminService.getAllStatuses().subscribe(
      (data) => {
        this.statuses = data;
      },
      (error) => {
        console.error('Error fetching user statuses:', error);
      }
    );
  }

  getStatus(userId: any): void {
    console.log('ab', userId)
    this.adminService.getStatus(userId).subscribe(
      (status: boolean) => {
        this.status = status;
        console.log(this.status);
        const checkbox = document.querySelectorAll<HTMLInputElement>('input[name="status"]');
        checkbox.forEach((checkbox: HTMLInputElement) => {
          if (checkbox.value === String(this.status)) {
            checkbox.checked = true;
          }
        });
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

}

