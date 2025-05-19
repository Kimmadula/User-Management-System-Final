import { Component, type OnInit } from "@angular/core"
import type { Router, ActivatedRoute } from "@angular/router"
import { type UntypedFormBuilder, type UntypedFormGroup, Validators } from "@angular/forms"
import { first } from "rxjs/operators"

import type { AccountService, AlertService } from "@app/_services"

@Component({ templateUrl: "login.component.html" })
export class LoginComponent implements OnInit {
  form: UntypedFormGroup
  loading = false
  submitted = false
  justRegistered = false

  constructor(
    private formBuilder: UntypedFormBuilder,
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

    // Check if user was redirected from registration page
    this.route.queryParams.subscribe((params) => {
      if (params["registered"]) {
        this.justRegistered = true
      }
    })
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
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/"
          this.router.navigateByUrl(returnUrl)
        },
        error: (error) => {
          this.alertService.error(error)
          this.loading = false
        },
      })
  }
}
