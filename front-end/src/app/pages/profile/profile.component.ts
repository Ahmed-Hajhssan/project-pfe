import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthModel } from '../../shared/auth-model';
import { AuthService } from '../../shared/auth-service';
import { environment } from '../../../environments/environment';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { catchError, throwError } from 'rxjs';
import { faFacebookF, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faPaperclip, faFilm, faCirclePlus, faArrowUpFromBracket, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faUser, faTrashCan, faPenToSquare, } from '@fortawesome/free-regular-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { currently_raising } from '../../shared/currently_raising';
import { previous_round } from '../../shared/previous_round';


interface Sector {
  name: string;
  checked: boolean;
  disabled?: boolean;
}

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

interface question {
  _id: number;
  Question: string;
  Answer: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private baseUrl = environment.domain;
  faUser = faUser;
  faTrashCan = faTrashCan;
  faPenToSquare = faPenToSquare;
  faCirclePlus = faCirclePlus;
  faFacebookF = faFacebookF;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faPaperclip = faPaperclip;
  faArrowUpFromBracket = faArrowUpFromBracket;
  faFilm = faFilm;
  faAngleRight = faAngleRight;
  imageProfile: any;
  imageMember: any;
  pitchDeck: any;
  otherDocument: any[] = [];
  vidoPitch: any;
  editForm: FormGroup;
  memberForm: FormGroup;
  editMemberForm: FormGroup;
  currentUser: AuthModel = {};
  photoSrc = "assets/images/Default_pfp.png";
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  @ViewChild('memberInput', { static: false }) memberInput: ElementRef;
  imageUrl: string;
  memberImageUrl: string;
  pitchDeckUrl: string;
  fileUrl: string;
  fileUrls: string[];
  videoUrl: string;
  videoPitchUrl: string;
  selectedMemberId: string;
  members: Member[] = [];
  files: File[] = [];
  sector: Sector[] = [];
  userSectors: string[];
  fileExists: boolean;
  filesExist: boolean;
  videoExist: boolean;
  videoUrlExist: boolean;
  membersExist: boolean;
  raisingForm: FormGroup;
  previousRoundForm: FormGroup;
  raising: currently_raising = {};
  previous_rounds: previous_round[] = [];
  questions:any=[]
  qn:number = 0;
  squestions: question[] = [];
  questionForm: FormGroup;
  addQuestionForm: FormGroup;
  roundID:any;
  company_name:string;
  country:string;
  city:string;
  url:string;


  constructor(
    public authService: AuthService,
    public fb: FormBuilder,
    private actRoute: ActivatedRoute,
  ) {
    this.initializeForm();

  }

  ngOnInit() {
    // let id = localStorage.getItem('userId');
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.authService.getUser(id).subscribe((res) => {
      this.currentUser = res;
      this.initializeForm();
      this.fetchImage();
      this.fetchFile();
      this.fetchFiles();
      this.fetchVideo();
      this.fetchVideoPitchUrl();
      this.fetchMembers();
      this.getSectors();
    });
    this.authService.getCurrentlyRaising(id).subscribe((res) => {
      this.raising = res;
    });
    this.fetchQuestions();
    this.fetchPreviousRounds();
  }

  getControls() {

    return (this.questionForm.get('questions') as FormArray).controls;
  }

  initPhoto(){
    this.photoSrc = "assets/images/Default_pfp.png"
  }

  onSelect(event: any) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
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

  updateMember(memberId: string) {
    this.selectedMemberId = memberId;
    this.authService.getMember(memberId).subscribe(
      (memberData) => {
        this.editMemberForm.patchValue({
          name: memberData.name,
          job: memberData.job,
          bio: memberData.bio,
          linkedin_url: memberData.linkedin_url,
          facebook_url: memberData.facebook_url,
          twitter_url: memberData.twitter_url
        });
        this.photoSrc=this.getmemberImageUrl(this.selectedMemberId);
      },

      (error: any) => {
        this.errorMgmt(error);
      }
    );
  }

  deleteMember(memberId: string) {
    if (window.confirm('Are you sure?')) {
      if (this.currentUser && this.currentUser._id) {
        this.authService.deleteMember(this.currentUser._id, memberId).subscribe({
          complete: () => {
            console.log('member successfully deleted!')
            this.fetchMembers();
          },
          error: (e) => {
            console.log(e);
          }
        })
      }
    }
  }

  uploadPitchDeck(event: any): void {
    const file = event.target.files[0];
    const formData = new FormData();

    formData.append('file', file);

    this.authService.uploadFile(formData)
      .subscribe(
        (response: any) => {
          let pitchDeck = response.filename;
          this.pitchDeck = pitchDeck;
          this.updatePitchDeck();
          console.log(pitchDeck);
        },
        (error: any) => {
          this.errorMgmt(error);
        }
      );
  }

  updatePitchDeck() {
    let body = {
      pitch_deck: this.pitchDeck
    };
    this.authService.updateUser(this.currentUser._id, body).subscribe({
      complete: () => {

        console.log('Content updated successfully!');
        this.currentUser.pitch_deck = this.pitchDeck;
        this.fetchFile();
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  fetchFile(): void {
    if (this.currentUser && this.currentUser._id) {
      if (this.currentUser.pitch_deck == null) {
        this.fileExists = false;
      } else {
        this.fileExists = true;
        this.pitchDeckUrl = this.baseUrl + '/api/uploads/' + this.currentUser.pitch_deck;
      }
    } else {
      console.error("User ID is undefined.");
    }
  }

  deleteFile(): void {
    if (window.confirm('Are you sure?')) {
      if (this.currentUser && this.currentUser._id) {
        this.authService.deleteFile(this.currentUser._id)
          .subscribe(
            response => {
              console.log(response.message);
              this.fileExists = false;
              this.pitchDeckUrl = '';
            },
            error => {
              console.error(error);
            }
          );
      } else {
        console.error("User ID is undefined.");
      }
    }
  }

  uploadOtherDoc(): void {
    const formData = new FormData();

    for (let index = 0; index < this.files.length; index++) {
      const element = this.files[index];
      formData.append('files', element);
    }

    this.authService.uploadFiles(formData)
      .subscribe((response: any) => {
        let otherDocument = response.map((file: any) => file.filename);
        this.updateOtherDoc(otherDocument);
        console.log(otherDocument);
      }, (error: any) => {
        this.errorMgmt(error);
      });
  }

  updateOtherDoc(otherDocument: string[]) {
    let body = {
      other_document: otherDocument
    };
    this.authService.updateUser(this.currentUser._id, body).subscribe({
      complete: () => {
        this.otherDocument = otherDocument;
        console.log('Content updated successfully!');
        this.currentUser.other_document = this.otherDocument;
        this.fetchFiles();
      },
      error: (e) => {
        console.log(e);
      }
    });
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

  getFileNameFromUrl(fileUrl: string): string {
    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    return fileName;
  }

  deleteOtherDoc(fileUrl: string): void {
    if (window.confirm('Are you sure?')) {
      const fileName = this.getFileNameFromUrl(fileUrl);

      if (this.currentUser && this.currentUser._id) {
        this.authService.deleteFiles(this.currentUser._id, fileName)
          .subscribe(
            response => {
              console.log(response.message);
              this.fileUrls = this.fileUrls.filter(url => url !== fileUrl);
              if (this.fileUrls.length === 0) {
                this.filesExist = false;
              };
            },
            error => {
              console.error(error.message);
            }
          );
      } else {
        console.error("User ID is undefined.");
      }
    }
  }

  uploadVideoPitch(event: any) {
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append('file', file);

    this.authService.uploadFile(formData)
      .pipe(catchError(this.errorMgmt))
      .subscribe((response: any) => {
        let vidoPitch = response.filename;
        this.vidoPitch = vidoPitch;
        this.updateVideoPitch();
        console.log(vidoPitch);

      });
  }

  updateVideoPitch() {
    let body = {
      video_pitch: this.vidoPitch
    };
    this.authService.updateUser(this.currentUser._id, body).subscribe({
      complete: () => {

        console.log('Content updated successfully!');
        this.currentUser.video_pitch = this.vidoPitch;
        this.fetchVideo();
      },
      error: (e) => {
        console.log(e);
      }
    });
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

  deleteVideo(): void {
    if (window.confirm('Are you sure?')) {
      if (this.currentUser && this.currentUser._id) {
        this.authService.deleteVideoPitch(this.currentUser._id)
          .subscribe(
            response => {
              console.log(response.message);
              this.videoExist = false;
              this.videoUrl = '';
            },
            error => {
              console.error(error);
            }
          );
      } else {
        console.error("User ID is undefined.");
      }
    }
  }

  updateVideoPitchUrl() {
    const videoUrlInput = document.getElementById('videoUrlInput') as HTMLInputElement;
    const Url = videoUrlInput.value;

    let body = {
      video_pitchUrl: Url
    };
    this.authService.updateUser(this.currentUser._id, body).subscribe({
      complete: () => {

        console.log('Content updated successfully!');
        this.currentUser.video_pitch = this.videoPitchUrl;
        this.fetchVideoPitchUrl();
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  fetchVideoPitchUrl(): void {
    if (this.currentUser && this.currentUser._id) {
      if (this.currentUser.video_pitchUrl == null) {
        this.videoUrlExist = false;
      } else {
        this.videoPitchUrl = this.currentUser.video_pitchUrl as string;
        this.videoUrlExist = true;
      }
    } else {
      console.error("User ID is undefined.");
    }
  }

  deleteVideoPitchUrl(): void {
    if (window.confirm('Are you sure?')) {
      if (this.currentUser && this.currentUser._id) {
        this.authService.deleteVideoPitchUrl(this.currentUser._id)
          .subscribe(
            response => {
              console.log(response.message);
              this.videoUrlExist = false;
              this.videoPitchUrl = '';
            },
            error => {
              console.error(error);
            }
          );
      } else {
        console.error("User ID is undefined.");
      }
    }
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  onFileUpload(): void {
    const imageBlob = this.fileInput.nativeElement.files[0];

    const formData = new FormData();
    formData.set('file', imageBlob);

    this.authService.uploadFile(formData)
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
    this.authService.updateUser(this.currentUser._id, body).subscribe({
      complete: () => {
        // this.router.navigateByUrl('/Profile');
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
        this.imageUrl = this.baseUrl + '/api/uploads/' + this.currentUser.image_profile;
      }
    } else {
      console.error("User ID is undefined.");
    }
  }

  // member image
  onMemberFileUpload() {
    return new Promise<void>((resolve, reject) => {
      const imageBlob = this.memberInput.nativeElement.files[0];
      if (imageBlob) {
        const formData = new FormData();
        formData.set('file', imageBlob);

        this.authService.uploadFile(formData)
          .subscribe(
            (response: any) => {
              let imageMember = response.filename;
              this.imageMember = imageMember;
              resolve();
              console.log(imageMember);
            },
            (error: any) => {
              reject();
              this.errorMgmt(error);
            }
          );
      } else {
        resolve();
      }
    })
  }

  updateMemberImage() {
    let body = {
      image_member: this.imageMember
    }
    this.authService.updateMember(this.selectedMemberId, body).subscribe({
      complete: () => {
        console.log('member updated successfully!');
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  getmemberImageUrl(memberId: string): string {
    const member = this.members.find(member => member._id === memberId);
    let memberImageUrl: string;
    if (member && member.image_member) {
      memberImageUrl = this.baseUrl + '/api/uploads/' + member.image_member;
    } else {
      memberImageUrl = "assets/images/Default_pfp.png";
    }
    return memberImageUrl;
  }

  selectFile() {
    document.getElementById('input-file')?.click();
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        this.photoSrc = e.target.result;
      };
      this.onMemberFileUpload();
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

    this.authService.updateUser(this.currentUser._id, body).subscribe({
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
      this.authService.getSectors(this.currentUser._id).subscribe(
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
      this.authService.deleteSector(this.currentUser._id, sectorName).subscribe(
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

  initializeForm() {
    this.editForm = this.fb.group({
      name: [this.currentUser.name],
      description: [this.currentUser.description],
      website_url: [this.currentUser.website_url],
      country: [this.currentUser.country],
      city: [this.currentUser.city],
      business_type: [this.currentUser.business_type],
      product_type: [this.currentUser.product_type],
      company_stage: [this.currentUser.company_stage],
      annual_revenue: [this.currentUser.annual_revenue],
      mrr: [this.currentUser.mrr],
      employee_count: [this.currentUser.employee_count],
      linkedin_url: [this.currentUser.linkedin_url],
      facebook_url: [this.currentUser.facebook_url],
      twitter_url: [this.currentUser.twitter_url],

    });

    this.memberForm = this.fb.group({
      name: [''],
      job: [''],
      bio: [''],
      linkedin_url: [''],
      facebook_url: [''],
      twitter_url: [''],
    });

    this.editMemberForm = this.fb.group({
      name: [''],
      job: [''],
      bio: [''],
      linkedin_url: [''],
      facebook_url: [''],
      twitter_url: ['']
    });
    this.raisingForm = this.fb.group({
      type: ['Founders'],
      size: [''],
      commited: [''],
      investors: [''],
      common_shares: [false],
      preferred_shares: [false],
      convertible_debt: [false],
      loan: [false],
      other: [false],
      business_angel: [false],
      accelerator_incubator: [false],
      vc_fund: [false],
      corporate: [false],
      public_grant: [false],
      crowd: [false]
    });
    this.previousRoundForm = this.fb.group({
      year: ['2024'],
      type: ['Founders'],
      size: [''],
      commited: [''],
      investors: [''],
      common_shares: [false],
      preferred_shares: [false],
      convertible_debt: [false],
      loan: [false],
      other: [false],
      business_angel: [false],
      accelerator_incubator: [false],
      vc_fund: [false],
      corporate: [false],
      public_grant: [false],
      crowd: [false]
    })
    this.questionForm = this.fb.group({
      questions: this.fb.array([])
    });
    this.addQuestionForm = this.fb.group({
      Question: [""],
      Answer: [""]
    })
  }

  initializePreviousRound(){
    this.previousRoundForm = this.fb.group({
      year: ['2024'],
      type: ['Founders'],
      size: [''],
      commited: [''],
      investors: [''],
      common_shares: [false],
      preferred_shares: [false],
      convertible_debt: [false],
      loan: [false],
      other: [false],
      business_angel: [false],
      accelerator_incubator: [false],
      vc_fund: [false],
      corporate: [false],
      public_grant: [false],
      crowd: [false]
    })
  }

  onSubmit() {
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.authService.updateUser(id, this.editForm.value).subscribe({
      complete: () => {
        console.log('Content updated successfully!');
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  memberFormSubmit() {
    if (this.currentUser && this.currentUser._id) {
      let id = this.currentUser._id;
      this.onMemberFileUpload().then(() => {
        let member = this.memberForm.value;
        member.image_member = this.imageMember;
        this.authService.createMember(id, member).subscribe({
          complete: () => {
            console.log('member successfully created!')
            this.fetchMembers();
          },
          error: (e) => {
            console.log(e);
          }
        })
      })
    }
  }

  editMemberFormSubmit() {
    const updatedMemberData = this.editMemberForm.value;
    const memberId = this.selectedMemberId;
    if (this.memberInput.nativeElement.files[0]) {
      this.updateMemberImage();
    }
    this.authService.updateMember(memberId, updatedMemberData).subscribe({
      complete: () => {
        console.log('member successfully updated!')
        this.fetchMembers();
      },
      error: (e) => {
        console.log(e);
      }
    })
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

  formatSecurities(raising: any) :any{
    try{
    const securities = this.getSecurityFields(raising);
    if (securities.length > 0) {
      return securities.join(', ');
    }
    }catch{
      
    }
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

  deleteRaising(){
    let id = localStorage.getItem('userId');
    this.authService.deleteCurrentlyRaising(id).subscribe({
      complete: () => {
        this.ngOnInit();
        console.log('Raising updated successfully!');
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  deleteRound(roundID:any){
    let id = localStorage.getItem('userId');
    this.authService.deletePreviousRound(id,roundID).subscribe({
      complete: () => {
        this.ngOnInit();
        console.log('Round deleted successfully!');
      },
      error: (e) => {
        console.log(e);
      }
    });
  }


  raisingSubmit(){
    let id = localStorage.getItem('userId');
    this.authService.createCurrentlyRaising(id, this.raisingForm.value).subscribe({
      complete: () => {
        this.ngOnInit();
        console.log('Content updated successfully!');
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  previousRoundSubmit(){
    let id = localStorage.getItem('userId');
    this.authService.createPreviousRound(id, this.previousRoundForm.value).subscribe({
      complete: () => {
        console.log('previous round successfully created!')
        this.ngOnInit();
      },
      error: (e) => {
        console.log(e);
      }
    })

  }


  getRaising(){
    let id = localStorage.getItem('userId');
    const myForm = this.raisingForm;
    this.authService.getCurrentlyRaising(id).subscribe((data)=>{
      myForm.patchValue({
        type: data.type,
        size: data.size,
        commited: data.commited,
        investors: data.investors,
        common_shares: data.common_shares,
        preferred_shares: data.preferred_shares,
        convertible_debt: data.convertible_debt,
        loan: data.loan,
        other: data.other,
        business_angel: data.business_angel,
        accelerator_incubator: data.accelerator_incubator,
        vc_fund: data.vc_fund,
        corporate: data.corporate,
        public_grant: data.public_grant,
        crowd: data.crowd
      });
      
    },
    (error: any) => {
      console.error(error);
    }
    )
  }

  getRound(roundId:any){
    let id = localStorage.getItem('userId');
    const myForm = this.previousRoundForm;
    this.authService.getPreviousRound(id,roundId).subscribe((data)=>{
      myForm.patchValue({
        year: data.year,
        type: data.type,
        size: data.size,
        commited: data.commited,
        investors: data.investors,
        common_shares: data.common_shares,
        preferred_shares: data.preferred_shares,
        convertible_debt: data.convertible_debt,
        loan: data.loan,
        other: data.other,
        business_angel: data.business_angel,
        accelerator_incubator: data.accelerator_incubator,
        vc_fund: data.vc_fund,
        corporate: data.corporate,
        public_grant: data.public_grant,
        crowd: data.crowd
      });
      this.roundID=roundId; 
    },
    (error: any) => {
      console.error(error);
    }
    )

  }


  fetchPreviousRounds(){
    let id = localStorage.getItem('userId')
    this.authService.getPreviousRounds(id).subscribe(
      (previous_rounds: previous_round[]) => {
        this.previous_rounds = previous_rounds;
        console.log(this.previous_rounds)
      },
      (error) => {
        console.log('Error retrieving rounds:', error);
      }
    );
  }

  raisingEdit(){
    const data = this.raisingForm.value;
    const id = localStorage.getItem('userId');
    this.authService.updateCurrentlyRaising(id,data).subscribe({
      complete:() => {
        console.log('raising successfully updated!');
        this.ngOnInit();
      },
      error: (e) => {
        console.log(e);
      }
    })
  }


  previousRoundEdit(){
    const data = this.previousRoundForm.value;
    const id = localStorage.getItem('userId');
    this.authService.updatePreviousRound(id,this.roundID,data).subscribe({
      complete:() => {
        console.log('raising successfully updated!');
        this.ngOnInit();
      },
      error: (e) => {
        console.log(e);
      }
    })
  }


  addQuestion(){
    let qn = this.qn++;
    var item = {
      'Question' : '',
      'Answer' : ''
    }
    this.questions.push(item);
    console.log(this.questions.length);
  }

  deleteQuestion(qn:any){
    console.log(qn);
    this.questions.splice(qn,1);
  }

  private fetchQuestions(): void {
    try{
    const employeeId = localStorage.getItem('userId'); // Replace with actual employee ID
    this.authService.getQuestions(employeeId)
      .subscribe(
        (questions: question[]) => {
          this.squestions = questions;
          this.patchForm();

        },
        
        (error) => {
          console.error('Error fetching questions:', error);
        }
      );
  }catch{}
  }

  private patchForm(): void {
    const formArray = this.questionForm.get('questions') as FormArray;
    this.squestions.forEach(question => {
      formArray.push(this.createQuestionFormGroup(question));
    });
  }

  private createQuestionFormGroup(question: question): FormGroup {
    const fb = this.fb.group({
      _id: question._id,
      Question: question.Question,
      Answer: question.Answer
    });    
    return fb;

  }

  editQuestion(){
    const updatedQuestionData = this.questionForm.value;
    const employeeId = localStorage.getItem('userId');
    updatedQuestionData.questions.forEach((question: any) => {
      this.authService.updateQuestion(employeeId, question._id, { Question: question.Question, Answer: question.Answer })
        .subscribe(
          () => {
            console.log('Question updated successfully');
            // Optionally, you can perform any additional actions here, such as displaying a success message or navigating to another page.
          },
          (error) => {
            console.error('Error updating question:', error);
            // Optionally, you can handle the error here, such as displaying an error message to the user.
          }
        );
    });
  }

  delQuestion(index:any){
    let id = localStorage.getItem('userId');
    const formArray = this.questionForm.get('questions') as FormArray;
    let questionId = formArray.at(index).value._id
    console.log(questionId);
    this.authService.deleteQuestion(id,questionId).subscribe({
      complete: () => {
        this.ngOnInit();
        console.log('question deleted successfully!');
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  submitQuestion(qn:any){
    let id = localStorage.getItem('userId');
    this.authService.createQuestion(id, this.addQuestionForm.value).subscribe({
      complete: () => {
        console.log('Question successfully created!')
        this.deleteQuestion(qn);
        this.ngOnInit();
      },
      error: (e) => {
        console.log(e);
      }
    })

  }

  show(any:any){

    const formArray = this.questionForm.get('questions') as FormArray;
    console.log(formArray.at(any).value._id);
  }

}
