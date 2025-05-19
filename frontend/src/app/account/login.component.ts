import { Component, type OnInit } from "@angular/core"
import type { Router, ActivatedRoute } from "@angular/router"
import { type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { first } from "rxjs/operators"

import type { AccountService, AlertService } from "@app/_services"

@Component({ templateUrl: "login.component.html" })
export class LoginComponent implements OnInit {
  form: FormGroup
  loading = false
  submitted = false
  registrationSuccess = false

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

    // Check if user just registered
    this.route.queryParams.subscribe((params) => {
      if (params["registered"] === "true") {
        this.registrationSuccess = true
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
