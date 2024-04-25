import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth-service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
  forgetForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.forgetForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])]
    });
  }

  Submit() {
    this.authService.sendEmail(this.forgetForm.value.email)
    .subscribe({
      next: (res) => {
        const successMessage = res.message;
        const successElement = document.getElementById('success');
        if (successElement) {
          successElement.textContent = successMessage;
        }
        this.forgetForm.reset();
      },
      error: (err) => {
        const errorMessage = err.error.message;
        const errorElement = document.getElementById('error');
        if (errorElement) {
          errorElement.textContent = errorMessage;
        }
      }
    });
  }
}