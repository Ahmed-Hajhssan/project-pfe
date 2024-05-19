import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/auth-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthModel } from '../../shared/auth-model';
import { environment } from '../../../environments/environment';
import { MatchMakingService } from '../../shared/match-making-service';
import { InvestorService } from '../../shared/investor-service';
import { InvestorModel } from '../../shared/investor-model';


interface Poste {
  title: string;
  content: string;
  file_path?: string;
  visibility?: string;
}

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent implements OnInit {

  private baseUrl = environment.domain;
  posteForm: FormGroup;
  Entreprenur: AuthModel = {};
  Investor: InvestorModel = {};
  imageUrl: string;
  postesExist: boolean;
  postes: any[] = [];
  id: any;
  role: any;

  constructor(
    public authService: AuthService,
    public investorService: InvestorService,
    private matchMakingService: MatchMakingService,
    public fb: FormBuilder,
    private actRoute: ActivatedRoute,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.role = localStorage.getItem("role");

    this.matchMakingService.getUser(id).subscribe((res) => {
      //this.postes = res.postes;
    });
    if (this.role == "entrepreneur") {
      this.authService.getUser(id).subscribe((res) => {
        this.Entreprenur = res;
        this.fetchImage();
        this.fetchPostes();

      });
    } else if (this.role == "investor") {
      this.investorService.getUser(id).subscribe((res) => {
        this.Investor = res;
        this.fetchImage();
        this.fetchPostes();

      });
    }
    this.initializeForm();
  }

  fetchPostes() {
    this.postesExist = false;
    let id = this.actRoute.snapshot.paramMap.get('id');
    id = id ? id : ''; // Provide a default empty string if id is null

    this.authService.getpostes(id).subscribe(
      (postes: Poste[]) => {
        this.postes = postes;
        this.sortPostesByIndexDesc();
        if (this.postes.length > 0) {
          this.postesExist = true;
        }
      },
      (error) => {
        console.log('Error retrieving members:', error);
      }
    );
  }

  sortPostesByIndexDesc() {
    this.postes.reverse();
  }

  fetchImage(): void {
    if (this.role == "entrepreneur") {

      if (this.Entreprenur && this.Entreprenur._id) {
        if (this.Entreprenur.image_profile == null) {
          this.imageUrl = 'assets/images/placeholder.png';
        } else {
          this.imageUrl = this.baseUrl + '/api/uploads/' + this.Entreprenur.image_profile;
        }
      } else {
        console.error("User ID is undefined.");
      }
    } else if (this.role == "investor") {

      if (this.Investor && this.Investor._id) {
        if (this.Investor.image_profile == null) {
          this.imageUrl = 'assets/images/placeholder.png';
        } else {
          this.imageUrl = this.baseUrl + '/investor/uploads/' + this.Investor.image_profile;
        }
      } else {
        console.error("User ID is undefined.");
      }
    }
  }

  initializeForm() {
    this.posteForm = this.fb.group({
      content: ['']
    });
  }

  onSubmit() {
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.authService.addPoste(id, this.posteForm.value).subscribe({
      complete: () => {
        console.log('new poste added successfully !');
        this.ngOnInit();
      },
      error: (e) => {
        console.log(e);
      }
    });
  }
}
