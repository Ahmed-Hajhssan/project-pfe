import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth-service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  submitted = false;
  showPassword: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      'email': ['', [
        Validators.required,
        Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
      ],
      ],
      'password': ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
    });
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password-input') as HTMLInputElement;
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;
  if (this.loginForm.invalid) {
    return false;
  } else {
    this.authService.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe({
        next: (res: any) => {
          const successMessage = res.message;
          const successElement = document.getElementById('success');
          if (successElement) {
            successElement.textContent = successMessage;
          }
          this.loginForm.reset();
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
