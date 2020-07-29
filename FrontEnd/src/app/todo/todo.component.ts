import { UserService } from './../services/user.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  todoForm: FormGroup;
  updateTodoForm: FormGroup;
  todoList: any[];
  submitted: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.submitted = false;
    this.todoForm = this.formBuilder.group({
      title: [null, Validators.required],
      description: [null, Validators.required]
    });

    this.updateTodoForm = this.formBuilder.group({
      title: [null, Validators.required],
      description: [null, Validators.required]
    });
    this.loadTodDos();
  }

  loadTodDos() {
    this.userService.getTodo().subscribe(
      (res: any) => {
        this.todoList = res.result;
      },
      err => {
        alert(err.message);
        this.todoList = [];
      }
    );
  }

  addTodo() {
    this.submitted = true;

    if (this.todoForm.invalid) {
      return;
    }

    this.userService.addTodo(this.todoForm.value).subscribe(
      (res: any) => {
        this.todoList.push(res.result);
        this.todoForm.reset();
        this.submitted = false;
        alert(res.message);
      },
      err => {
        alert(err.message);
        this.todoList = [];
      }
    );
  }

  doneTodo(idx: number) {
    const todItem: any = this.todoList[idx];
    this.userService.deleteTodo(todItem._id).subscribe(
      (res: any) => {
        this.todoList.splice(idx, 1)  ;
        alert(res.message);
      },
      err => {
        alert(err.message);
      }
    );
  }

  toggleEdit(i: number) {
    this.todoList.forEach(todo => (todo.edit = false));
    this.updateTodoForm.patchValue({
      title: this.todoList[i].title,
      description: this.todoList[i].description
    });
    this.todoList[i].edit = true;
  }

  updateTodo(idx: number) {
    if (this.updateTodoForm.invalid) {
      return;
    }
    const todoItem = { ...this.todoList[idx], ...this.updateTodoForm.value };
    this.userService.updateTodo(todoItem._id, todoItem).subscribe(
      (res: any) => {
        this.todoList[idx] = { ...todoItem, edit: false };
        alert(res.message);
      },
      err => {
        alert(err.message);
      }
    );
  }
}
