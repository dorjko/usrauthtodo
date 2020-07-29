import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { UserService } from '../services/user.service';

@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;

    if (
      this.registerForm.invalid ||
      this.registerForm.value.password !==
        this.registerForm.value.confirmPassword
    ) {
      return;
    }

    this.userService.register(this.registerForm.value).subscribe(
      (res: any) => {
        alert(res.message);
        this.router.navigate(['/login']);
      },
      error => {
        alert(error.message);
      }
    );
  }
}
