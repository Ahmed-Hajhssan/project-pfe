import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/auth-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthModel } from '../../shared/auth-model';
import { environment } from '../../../environments/environment';
import { MatchMakingService } from '../../shared/match-making-service';
import { InvestorService } from '../../shared/investor-service';
import { InvestorModel } from '../../shared/investor-model';


interface Post {
  title: string;
  content: string;
  file_path?: string;
  visibility?: string;
  likes?: string;
  comments?: string[];
}

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent implements OnInit {

  private baseUrl = environment.domain;
  posteForm: FormGroup;
  editPost: FormGroup;
  Entreprenur: AuthModel = {};
  Investor: InvestorModel = {};
  imageUrl: string;
  postsExist: boolean;
  posts: any[] = [];
  id: any;
  role: any;
  selectedPosteId: string;

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
        this.fetchPosts();

      });
    } else if (this.role == "investor") {
      this.investorService.getUser(id).subscribe((res) => {
        this.Investor = res;
        this.fetchImage();
        this.fetchPosts();

      });
    }
    this.initializeForm();
  }

  fetchPosts() {
    this.postsExist = false;
    let id = this.actRoute.snapshot.paramMap.get('id');
    id = id ? id : ''; // Provide a default empty string if id is null

    this.authService.getposts(id).subscribe(
      (posts: Post[]) => {
        this.posts = posts;
        this.sortPostesByIndexDesc();
        if (this.posts.length > 0) {
          this.postsExist = true;
        }
      },
      (error) => {
        console.log('Error retrieving members:', error);
      }
    );
  }

  sortPostesByIndexDesc() {
    this.posts.reverse();
  }

  deletePost(postId: any) {
    if (window.confirm('Are you sure?')) {
      let id = this.actRoute.snapshot.paramMap.get('id');
      id = id ? id : '';
      this.authService.deletePost(id, postId).subscribe({
        complete: () => {
          console.log('post successfully deleted!')
          this.fetchPosts();
        },
        error: (e) => {
          console.log(e);
        }
      })
    }

  }
  updatePost(postId: string) {
    this.selectedPosteId = postId;
    this.authService.getPost(postId).subscribe(
      (memberData) => {
        this.editPost.patchValue({
          content: memberData.content,
        });
      },

      (error: any) => {
      }
    );
  }

  editPostSubmit() {
    const updatedMemberData = this.editPost.value;
    const postId = this.selectedPosteId;
    this.authService.updatePost(postId, updatedMemberData).subscribe({
      complete: () => {
        console.log('post successfully updated!')
        this.fetchPosts();
      },
      error: (e) => {
        console.log(e);
      }
    })
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

    this.editPost = this.fb.group({
      content: [''],
    });
  }

  onSubmit() {
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.authService.addPost(id, this.posteForm.value).subscribe({
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
