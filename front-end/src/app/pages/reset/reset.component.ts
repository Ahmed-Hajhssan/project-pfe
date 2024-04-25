import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../shared/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.scss'
})
export class ResetComponent implements OnInit {
  resetForm: FormGroup;
  submitted = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  token!: string;

  constructor(private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.resetForm = this.fb.group({
      'password': ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
      'confirmPassword': ['', [
        Validators.required,
      ]],
    }, { validator: this.passwordMatchValidator });

    this.activatedRoute.params.subscribe(val => {
      this.token = val['token'];
      // console.log(this.token);
    })
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      control.get('confirmPassword')?.setErrors(null);
    }
  }
  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password-input') as HTMLInputElement;
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    this.showPassword = !this.showPassword;
  }
  ConfirmPasswordVisibility() {
    const passwordInput = document.getElementById('confirm-password-input') as HTMLInputElement;
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    this.showConfirmPassword = !this.showConfirmPassword;
  }


  reset() {
    this.submitted = true;
    let resetObj = {
      token: this.token,
      password: this.resetForm.value.password
    }
    console.log(this.token, this.resetForm.value.password)
    this.authService.resetPassword(resetObj)
      .subscribe({
        next: (res) => {
          alert(res.message);
          this.resetForm.reset();
          this.router.navigate(['login']);
          return true;
        },
        error: (err) => {
          alert(err.error.message);
          return false;
        }
      });
  }
}
