import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth-service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  signupForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;


  constructor(private formBuilder: FormBuilder, private authService: AuthService,  private router: Router) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      'email': ['', [
        Validators.required,
        Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
      ],
      ],
      'password': ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
      'confirmPassword': ['', [
        Validators.required,
      ]],
      'role': ['', [
        Validators.required
      ]],
      'GPDR': ['', [
        Validators.required
      ]],
    }, { validator: this.passwordMatchValidator });
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
    return this.signupForm.get('confirmPassword');
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

  onSubmit() {
    this.submitted = true;
    if (this.signupForm.invalid) {
      return false;
    } else {
      console.log(this.signupForm.value.role);
      this.authService.signupUser(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.role)
        .subscribe({
          next: (res: any) => {
            const successMessage = res.message;
              alert(successMessage);
              this.router.navigate(['login']);
            
          },
          error: (err: any) => {
            const errorMessage = err.error.message;
            const errorElement = document.getElementById('error');
            if (errorElement) {
              errorElement.textContent = errorMessage;
            }
          }
        });
        return true; 
    }
  }
}
