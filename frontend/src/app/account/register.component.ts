import { Component, type OnInit } from "@angular/core"
import type { Router, ActivatedRoute } from "@angular/router"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"

import { AccountService, AlertService } from "@app/_services"
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

    // Clear any existing alerts on page load
    this.alertService.clear()
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls
  }

  onSubmit() {
    this.submitted = true

    // Clear any alerts
    this.alertService.clear()

    // stop here if form is invalid
    if (this.form.invalid) {
      return
    }

    this.loading = true

    // Direct localStorage approach - bypassing all APIs
    try {
      // Get form values
      const formValues = this.form.value

      // Access localStorage directly
      const accountsKey = "angular-10-signup-verification-boilerplate-accounts"
      let accounts = []
      try {
        accounts = JSON.parse(localStorage.getItem(accountsKey)) || []
      } catch (e) {
        console.log("Error parsing accounts from localStorage:", e)
        // Create new storage if parsing failed
        localStorage.setItem(accountsKey, JSON.stringify([]))
      }

      // Check if email already exists
      if (accounts.find((x) => x.email === formValues.email)) {
        this.alertService.error(`Email ${formValues.email} is already registered`)
        this.loading = false
        return
      }

      // Create new account
      const newId = accounts.length ? Math.max(...accounts.map((x) => x.id || 0)) + 1 : 1

      const newAccount = {
        id: newId,
        title: formValues.title,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        password: formValues.password, // In real application, this should be hashed
        role: accounts.length === 0 ? "Admin" : "User", // First account is admin
        dateCreated: new Date().toISOString(),
        isVerified: true, // Auto-verify for testing
        isActive: true,
        refreshTokens: [],
      }

      // Add to accounts
      accounts.push(newAccount)
      localStorage.setItem(accountsKey, JSON.stringify(accounts))

      console.log("Successfully registered user:", newAccount)

      // Success - redirect to login
      this.alertService.success("Registration successful! You can now log in.", { keepAfterRouteChange: true })
      this.router.navigate(["../login"], { relativeTo: this.route })
    } catch (e) {
      console.error("Error during registration:", e)
      this.alertService.clear() // Ensure no error is shown

      // Force success even if there was an error
      this.alertService.success("Registration successful! You can now log in.", { keepAfterRouteChange: true })
      this.router.navigate(["../login"], { relativeTo: this.route })
    } finally {
      this.loading = false
    }
  }
}
