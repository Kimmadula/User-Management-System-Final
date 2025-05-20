import { Component, type OnInit } from "@angular/core"
import type { Router, ActivatedRoute } from "@angular/router"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { first } from "rxjs/operators"

import { AccountService, AlertService } from "@app/_services"

@Component({ templateUrl: "login.component.html" })
export class LoginComponent implements OnInit {
  form: FormGroup
  loading = false
  submitted = false
  returnUrl: string

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/"

    // Check if user just registered
    const registered = this.route.snapshot.queryParams["registered"]
    if (registered) {
      this.alertService.success("Registration successful! Please check your email for verification instructions.", {
        keepAfterRouteChange: true,
      })
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls
  }

  onSubmit() {
    this.submitted = true

    // reset alerts on submit
    this.alertService.clear()

    // stop here if form is invalid
    if (this.form.invalid) {
      return
    }

    this.loading = true
    this.accountService
      .login(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl])
        },
        error: (error) => {
          this.alertService.error(error)
          this.loading = false
        },
      })
  }
}
