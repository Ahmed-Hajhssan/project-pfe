import { Component, OnInit, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/auth-service';
import { ActivatedRoute } from '@angular/router';
import { AuthModel } from '../../shared/auth-model';
import { faLocationDot, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { ViewportScroller } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


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
        this.imageUrl = 'assets/images/placeholder.png';
      } else {
        this.imageUrl = this.baseUrl + '/api/uploads/' + this.currentUser.image_profile;
      }
    } else {
      console.error("User ID is undefined.");
    }
  }

  fetchVideo(): void {
    if (this.currentUser && this.currentUser._id) {
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
    if (this.currentUser && this.currentUser._id) {
      if (this.currentUser.video_pitchUrl === null) {
        this.videoUrlExist = false;
      } else {
        this.videoUrlExist = true;
        const youtubeLink = this.currentUser.video_pitchUrl as string;
        const videoId = youtubeLink.split('v=')[1];
        this.videoPitchUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
        console.log(this.videoPitchUrl);
      }
    } else {
      console.error("User ID is undefined.");
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
      memberImageUrl = this.baseUrl + '/uploads/' + member.image_member;
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

}
