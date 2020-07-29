import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { UserService } from '../services/user.service';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    this.userService.login(this.loginForm.value).subscribe(
      (res: any) => {
        alert(res.message);
        if (res.result && res.result.token) {
          this.loginForm.reset();
          localStorage.setItem('todo-user', res.result.token);
          this.router.navigate(['/to-do']);
          return;
        }
        alert(`Token not found`);
      },
      error => {
        alert(error.message);
      }
    );
  }
}
