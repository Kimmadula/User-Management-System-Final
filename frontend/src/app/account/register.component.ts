import { Component, type OnInit } from "@angular/core"
import type { Router, ActivatedRoute } from "@angular/router"
import { type FormBuilder, type FormGroup, Validators } from "@angular/forms"

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

    // Create a simplified registration process that bypasses the backend
    try {
      // Get form values
      const formValues = this.form.value
      console.log("Registration form values:", formValues)

      // Add user directly to localStorage to bypass backend issues
      const accountsKey = "angular-10-signup-verification-boilerplate-accounts"
      const accounts = JSON.parse(localStorage.getItem(accountsKey) || "[]")

      // Check if email already exists
      if (accounts.find((x) => x.email === formValues.email)) {
        this.alertService.error(`Email ${formValues.email} is already registered`)
        this.loading = false
        return
      }

      // Create new account
      const newId = accounts.length ? Math.max(...accounts.map((x) => x.id)) + 1 : 1
      const newAccount = {
        id: newId,
        title: formValues.title,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        password: formValues.password,
        role: "User",
        dateCreated: new Date().toISOString(),
        isVerified: true, // Auto-verify for testing
        isActive: true,
        verificationToken: "verified", // Dummy token
        refreshTokens: [],
      }

      // Add to accounts
      accounts.push(newAccount)
      localStorage.setItem(accountsKey, JSON.stringify(accounts))

      console.log("Successfully registered user:", newAccount)

      // Show success message and redirect
      this.alertService.success("Registration successful! Your account is now verified.", {
        keepAfterRouteChange: true,
      })

      // Redirect to login page
      setTimeout(() => {
        this.router.navigate(["../login"], { relativeTo: this.route })
      }, 1000)
    } catch (error) {
      console.error("Registration error:", error)
      this.alertService.error("Registration failed. Please try again later.")
      this.loading = false
    }
  }
}
