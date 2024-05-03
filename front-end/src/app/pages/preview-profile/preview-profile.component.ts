import { Component, OnInit, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/auth-service';
import { ActivatedRoute } from '@angular/router';
import { AuthModel } from '../../shared/auth-model';
import { faLocationDot, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { ViewportScroller } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { currently_raising } from '../../shared/currently_raising';
import { previous_round } from '../../shared/previous_round';


interface Member {
  _id: string;
  image_member?: string;
  name: string;
  job: string;
  bio: string;
  linkedin_url: string;
  facebook_url: string;
  twitter_url: string;
}

@Component({
  selector: 'app-preview-profile',
  templateUrl: './preview-profile.component.html',
  styleUrl: './preview-profile.component.scss'
})
export class PreviewProfileComponent implements OnInit {
  private baseUrl = environment.domain;
  currentUser: AuthModel = {};
  imageUrl: string;
  faLocationDot = faLocationDot;
  faFacebookF = faFacebookF;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faPaperclip = faPaperclip;
  videoUrl: string;
  videoPitchUrl: SafeResourceUrl;
  pitchDeckUrl: SafeResourceUrl;
  videoExist: boolean;
  videoUrlExist: boolean;
  fileExists : boolean;
  membersExist: boolean;
  filesExist: boolean;
  members: Member[] = [];
  fileUrls: string[];
  photoSrc = "assets/images/Default_pfp.png";
  userSectors: string[];
  raising: currently_raising = {};
  previous_rounds: previous_round[] = [];

  constructor(
    public authService: AuthService,
    private actRoute: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.authService.getUser(id).subscribe((res) => {
      this.currentUser = res;
      this.fetchImage();
      this.fetchVideo();
      this.fetchVideoPitchUrl();
      this.fetchFile();
      this.fetchMembers();
      this.fetchFiles();
      this.getSectors();
    });
    this.authService.getCurrentlyRaising(id).subscribe((res) => {
      this.raising = res;
    });
      this.fetchPreviousRounds();
  }

  smoothScroll(target: string) {
    const targetElement = this.elementRef.nativeElement.querySelector(target);
    if (targetElement) {
      const yOffset = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offset = 80; 
      this.viewportScroller.scrollToPosition([0, yOffset - offset]);
    }
  }

  fetchImage(): void {
    if (this.currentUser && this.currentUser._id) {
      if (this.currentUser.image_profile == null) {
        this.imageUrl = 'assets/images/3da39-no-user-image-icon-27.webp';
      } else {
        this.imageUrl = this.baseUrl + '/api/uploads/' + this.currentUser.image_profile;
      }
    } else {
      console.error("User ID is undefined.");
    }
  }

  fetchVideo(): void {
    if (this.currentUser && this.currentUser._id ) {
      if (this.currentUser.video_pitch == null) {
        this.videoExist = false;
      } else {
        this.videoExist = true;
        this.videoUrl = this.baseUrl + '/api/uploads/' + this.currentUser.video_pitch;
      }
    } else {
      console.error("User ID is undefined.");
    }
  }

  fetchVideoPitchUrl(): void {
    if (this.currentUser && this.currentUser._id && this.currentUser.video_pitchUrl) {
      if (this.currentUser.video_pitchUrl === null) {
        this.videoUrlExist = false;
      } else {
        this.videoUrlExist = true;
        const youtubeLink = this.currentUser.video_pitchUrl as string;
        const videoId = youtubeLink.split('v=')[1];
        this.videoPitchUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
        console.log(this.videoPitchUrl);
      }
    }
  }

  fetchFile(): void {
    if (this.currentUser && this.currentUser._id) {
      if (this.currentUser.pitch_deck == null) {
        this.fileExists = false;
      } else {
        this.fileExists = true;
        this.pitchDeckUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.baseUrl + '/api/uploads/' + this.currentUser.pitch_deck);
      }
    } else {
      console.error("User ID is undefined.");
    }
  }

  fetchMembers() {
    this.membersExist = false;
    if (this.currentUser && this.currentUser._id) {
      this.authService.getMembers(this.currentUser._id).subscribe(
        (members: Member[]) => {
          this.members = members;
          if (this.members.length > 0) {
            this.membersExist = true;
          }
        },
        (error) => {
          console.log('Error retrieving members:', error);
        }
      );
    }
  }

  getmemberImageUrl(memberId: string): string {
    const member = this.members.find(member => member._id === memberId);
    let memberImageUrl: string;
    if (member && member.image_member) {
      memberImageUrl = this.baseUrl + '/api/uploads/' + member.image_member;
    } else {
      memberImageUrl = this.photoSrc;
    }
    return memberImageUrl;
  }

  getFileNameFromUrl(fileUrl: string): string {
    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    return fileName;
  }

  fetchFiles(): void {
    if (this.currentUser && this.currentUser._id) {
      let fileUrls: string[] = [];

      if (this.currentUser.other_document && this.currentUser.other_document.length > 0) {
        fileUrls = this.currentUser.other_document.map(filename => this.baseUrl + '/api/uploads/' + filename);
      }

      if (fileUrls.length === 0) {
        this.filesExist = false;
      } else {
        this.fileUrls = fileUrls;
        this.filesExist = true;
      }
    } else {
      console.error("User ID is undefined.");
    }
  }

  getSectors() {
    if (this.currentUser && this.currentUser._id) {
      this.authService.getSectors(this.currentUser._id).subscribe(
        (sectors: string[]) => {
          this.userSectors = sectors;
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  getSecurityFields(raising:any): string[] {
    const securityFields: string[] = [];
    const formValue = raising;

    if (formValue.common_shares) {
      securityFields.push('Common shares');
    }
    if (formValue.preferred_shares) {
      securityFields.push('Preferred shares');
    }
    if (formValue.convertible_debt) {
      securityFields.push('Convertible debt');
    }
    if (formValue.loan) {
      securityFields.push('Loan');
    }
    if (formValue.other) {
      securityFields.push('Other');
    }
    return securityFields;
    
  }

  formatSecurities(raising: any) :any{
    try{
    const securities = this.getSecurityFields(raising);
    if (securities.length > 0) {
      return securities.join(', ');
    }
    }catch{
      
    }
  }

  getSourceFields(raising:any): string[] {
    const sourceFields: string[] = [];
    let formValue = raising;
    if (formValue.business_angel) {
      sourceFields.push('Business angel');
    }
    if (formValue.accelerator_incubator) {
      sourceFields.push('Accelerator incubator');
    }
    if (formValue.vc_fund) {
      sourceFields.push('VC fund');
    }
    if (formValue.corporate) {
      sourceFields.push('Corporate');
    }
    if (formValue.public_grant) {
      sourceFields.push('Public grant');
    }
    if (formValue.crowd) {
      sourceFields.push('Crowd');
    }
    return sourceFields;
  }
  
  formatSources(raising: any) : any {
    try{
      const sources = this.getSourceFields(raising);
      if (sources.length > 0) {
        return sources.join(', ');
      }
      }catch{
        
      }
  }
  fetchPreviousRounds(){
    if (this.currentUser && this.currentUser._id) {
    this.authService.getPreviousRounds(this.currentUser._id).subscribe(
      (previous_rounds: previous_round[]) => {
        this.previous_rounds = previous_rounds;
        console.log(this.previous_rounds)
      },
      (error) => {
        console.log('Error retrieving rounds:', error);
      }
    );
  }
}

}
