import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { InvestorModel } from "../../shared/investor-model";
import { InvestorService } from '../../shared/investor-service';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { throwError } from 'rxjs';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

interface Sector {
  name: string;
  checked: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-investor-profile',
  templateUrl: './investor-profile.component.html',
  styleUrl: './investor-profile.component.scss'
})
export class InvestorProfileComponent implements OnInit{
  private baseUrl = environment.domain;
  currentUser: InvestorModel = {};
  editForm: FormGroup;
  faAngleRight = faAngleRight;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  imageUrl: string;
  imageProfile: any;
  sector: Sector[] = [];
  userSectors: string[];
  faCirclePlus = faCirclePlus;
  name:string;
  country:string;
  city:string;
  phone:string;

  constructor(
    public investorService: InvestorService,
    public fb: FormBuilder,
    private actRoute: ActivatedRoute,
  ) {
    this.initializeForm();
  }

    
  ngOnInit() {
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.investorService.getUser(id).subscribe((res) => {
      this.currentUser = res;
      this.initializeForm();
      this.fetchImage();
      this.getSectors();
    });
  }

  onFileUpload(): void {
    const imageBlob = this.fileInput.nativeElement.files[0];

    const formData = new FormData();
    formData.set('file', imageBlob);

    this.investorService.uploadFile(formData)
      .subscribe(
        (response: any) => {
          let imageProfile = response.filename;
          this.imageProfile = imageProfile;
          this.updateProfileImage();
          console.log(imageProfile);
        },
        (error: any) => {
          this.errorMgmt(error);
        }
      );
  }

  updateProfileImage() {
    let body = {
      image_profile: this.imageProfile
    }
    this.investorService.updateUser(this.currentUser._id, body).subscribe({
      complete: () => {
        console.log('Content updated successfully!');
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  fetchImage(): void {
    if (this.currentUser && this.currentUser._id) {
      if (this.currentUser.image_profile == null) {
        this.imageUrl = 'assets/images/placeholder.png';
      } else {
        this.imageUrl = this.baseUrl + '/investor/uploads/' + this.currentUser.image_profile;
        console.log(this.imageUrl)
      }
    } else {
      console.error("User ID is undefined.");
    }
  }

  displaySelectedImage(event: any, elementId: string) {
    const selectedImage = document.getElementById(elementId) as HTMLImageElement;

    if (selectedImage) {
      const fileInput = event.target;
      console.log(fileInput);
      console.log(fileInput.files);
      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          selectedImage.src = e.target.result;
          this.onFileUpload();
        };

        reader.readAsDataURL(fileInput.files[0]);
      } else {
        const defaultImage = new Image();
        defaultImage.src = 'assets/images/placeholder.png';
        defaultImage.onload = () => {
          selectedImage.src = defaultImage.src;
          this.onFileUpload();
        };
      }
    } else {
      console.error(`Element with id '${elementId}' not found.`);
    }
  }

    openFileInput(inputId: string) {
    const fileInput = document.getElementById(inputId);
    if (fileInput) {
      fileInput.click();
    } else {
      console.error(`File input with id '${inputId}' not found.`);
    }
  }

  sectors: Sector[] = [
    { name: '3D Printing', checked: false },
    { name: 'Advanced Materials', checked: false },
    { name: 'Aerospace', checked: false },
    { name: 'Agriculture', checked: false },
    { name: 'AI', checked: false },
    { name: 'Art & Design', checked: false },
    { name: 'Automotive', checked: false },
    { name: 'Automotive & Transport', checked: false },
    { name: 'Biotechnology', checked: false },
    { name: 'Blockchain', checked: false },
    { name: 'Chemistry', checked: false },
    { name: 'Cleantech', checked: false },
    { name: 'Climate', checked: false },
    { name: 'Construction', checked: false },
    { name: 'Data & Analytics', checked: false },
    { name: 'Drones', checked: false },
    { name: 'E-commerce', checked: false },
    { name: 'Education', checked: false },
    { name: 'Electronics', checked: false },
    { name: 'Energy', checked: false },
    { name: 'Enterprise Software', checked: false },
    { name: 'Fashion', checked: false },
    { name: 'Fintech', checked: false },
    { name: 'FMCG', checked: false },
    { name: 'Food & Beverage', checked: false },
    { name: 'Gaming', checked: false },
    { name: 'Generative Al', checked: false },
    { name: 'Hardware', checked: false },
    { name: 'Home', checked: false },
    { name: 'ICT', checked: false },
    { name: 'Industry', checked: false },
    { name: 'Insurtech', checked: false },
    { name: 'Internet loT', checked: false },
    { name: 'IT', checked: false },
    { name: 'Legal', checked: false },
    { name: 'Lifestyle', checked: false },
    { name: 'Distribution & Logistics', checked: false },
    { name: 'Manufacturing', checked: false },
    { name: 'Marine', checked: false },
    { name: 'Marketing & Advertising', checked: false },
    { name: 'Marketplace', checked: false },
    { name: 'Media & Entertainment', checked: false },
    { name: 'Healthcare & Medtech', checked: false },
    { name: 'Mining', checked: false },
    { name: 'Mobile', checked: false },
    { name: 'Nanotechnology', checked: false },
    { name: 'Oil & Gas', checked: false },
    { name: 'Pharma', checked: false },
    { name: 'Real Estate', checked: false },
    { name: 'Recruitment', checked: false },
    { name: 'Retailing', checked: false },
    { name: 'Robotics', checked: false },
    { name: 'SaaS', checked: false },
    { name: 'Security & Cybersecurity', checked: false },
    { name: 'Sharing Economy', checked: false },
    { name: 'Smart Cities', checked: false },
    { name: 'Social Networking', checked: false },
    { name: 'Sports', checked: false },
    { name: 'Telecommunications', checked: false },
    { name: 'Transport & Logistics', checked: false },
    { name: 'Travel', checked: false },
    { name: 'VR & AR', checked: false },
    { name: 'Web3', checked: false }
  ];

  selectedCount = 0;

  updateSelectedLabels() {
    this.selectedCount = this.sectors.filter(sector => sector.checked).length;

    if (this.selectedCount >= 5) {
      this.sectors.forEach(sector => {
        if (!sector.checked) {
          sector.disabled = true;
        }
      });
    } else {
      this.sectors.forEach(sector => {
        if (sector.disabled) {
          sector.disabled = undefined;
        }
      });
    }
  }

  resetSelection() {
    this.sectors.forEach(sector => {
      sector.checked = false;
      sector.disabled = false;
    });

    this.selectedCount = 0;
  }

  updateSector() {
    const selectedSectors = this.sectors
      .filter(sector => sector.checked)
      .map(sector => sector.name);

    const body = {
      sector: selectedSectors
    };

    this.investorService.updateUser(this.currentUser._id, body).subscribe({
      next: () => {
        console.log('Content updated successfully!');
        this.getSectors();
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  getSectors() {
    if (this.currentUser && this.currentUser._id) {
      this.investorService.getSectors(this.currentUser._id).subscribe(
        (sectors: string[]) => {
          this.userSectors = sectors;
          // select the sectors from database in the sectors array
          this.sectors.forEach(sector => {
            sector.checked = this.userSectors.includes(sector.name);
          });
          // update the selected count 
          this.updateSelectedLabels();
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  deleteSector(sectorName: string) {
    if (this.currentUser && this.currentUser._id) {
      this.investorService.deleteSector(this.currentUser._id, sectorName).subscribe(
        (response: any) => {
          console.log(response.message);
          // refresh sectors
          this.getSectors();
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }
  
  initializeForm(){
    this.editForm = this.fb.group({
      name: [this.currentUser.name],
      description: [this.currentUser.description],
      phone_number: [this.currentUser.phone_number],
      country: [this.currentUser.country],
      city: [this.currentUser.city],
      linkedin_url: [this.currentUser.linkedin_url],
      company: [this.currentUser.company],
      investor_type: [this.currentUser.investor_type],
      preferred_area: [this.currentUser.preferred_area],
      company_stage: [this.currentUser.company_stage],
      investment_amount: [this.currentUser.investment_amount],
      facebook_url: [this.currentUser.facebook_url],
      twitter_url: [this.currentUser.twitter_url],

    });
  }

  onSubmit() {
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.investorService.updateUser(id, this.editForm.value).subscribe({
      complete: () => {
        console.log('Content updated successfully!');
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  private errorMgmt(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
  
}
