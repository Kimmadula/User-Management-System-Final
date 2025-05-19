import { Component, type OnInit } from "@angular/core"
import type { Router, ActivatedRoute } from "@angular/router"
import { type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { first } from "rxjs/operators"

import type { AccountService, AlertService } from "@app/_services"
import { MustMatch } from "@app/_helpers"

@Component({ templateUrl: "register.component.html" })
export class RegisterComponent implements OnInit {
  form: FormGroup
  loading = false
  submitted = false

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        title: ["", Validators.required],
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
        acceptTerms: [false, Validators.requiredTrue],
      },
      {
        validator: MustMatch("password", "confirmPassword"),
      },
    )
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

    // Remove the try-catch that might be swallowing errors
    this.accountService
      .register(this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          // Registration successful
          this.alertService.success("Registration successful, please check your email for verification instructions", {
            keepAfterRouteChange: true,
          })
          this.router.navigate(["../login"], { relativeTo: this.route })
        },
        error: (error) => {
          // Log the actual error for debugging
          console.error("Registration error:", error)

          // Show a more specific error message if available
          const errorMessage = error?.error?.message || error?.message || "Registration failed"
          this.alertService.error(errorMessage)
          this.loading = false
        },
        complete: () => {
          this.loading = false
        },
      })
  }
}
