import { Injectable } from "@angular/core"
import type { Router } from "@angular/router"
import { type HttpClient, HttpErrorResponse } from "@angular/common/http"
import { BehaviorSubject, type Observable, throwError } from "rxjs"
import { map, finalize, catchError, tap } from "rxjs/operators"

import { environment } from "@environments/environment"
import type { Account } from "@app/_models"

const baseUrl = `${environment.apiUrl}/accounts`

@Injectable({ providedIn: "root" })
export class AccountService {
  private accountSubject: BehaviorSubject<Account>
  public account: Observable<Account>
  private refreshTokenTimeout: any

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {
    this.accountSubject = new BehaviorSubject<Account>(null)
    this.account = this.accountSubject.asObservable()
  }

  public get accountValue(): Account {
    return this.accountSubject.value
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/accounts/authenticate`, { email, password }).pipe(
      map((response) => {
        // Check if non-admin account is active before allowing login
        if (response.role !== "Admin" && !response.isActive) {
          throw new Error("Your account has been deactivated. Please contact an administrator.")
        }

        // Authentication successful
        this.accountSubject.next(response)
        this.startRefreshTokenTimer()
        return response
      }),
      catchError(this.handleError),
    )
  }

  logout() {
    this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe()
    this.stopRefreshTokenTimer()
    this.accountSubject.next(null)
    this.router.navigate(["/account/login"])
  }

  refreshToken() {
    return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true }).pipe(
      map((account) => {
        this.accountSubject.next(account)
        this.startRefreshTokenTimer()
        return account
      }),
      catchError(this.handleError),
    )
  }

  register(account: Account) {
    console.log("Registering account:", account)
    return this.http.post(`${baseUrl}/register`, account).pipe(
      tap(() => console.log("Registration successful")),
      catchError((error) => {
        console.error("Registration error in service:", error)
        if (error instanceof HttpErrorResponse) {
          console.error("Status:", error.status, "Message:", error.message)
          return throwError(() => error.error?.message || "Registration failed. Please try again.")
        }
        return throwError(() => "Registration failed. Please try again.")
      }),
    )
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token }).pipe(catchError(this.handleError))
  }

  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/forgot-password`, { email }).pipe(catchError(this.handleError))
  }

  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token }).pipe(catchError(this.handleError))
  }

  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http
      .post(`${baseUrl}/reset-password`, { token, password, confirmPassword })
      .pipe(catchError(this.handleError))
  }

  getAll() {
    return this.http.get<Account[]>(baseUrl).pipe(catchError(this.handleError))
  }

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`).pipe(catchError(this.handleError))
  }

  create(params) {
    return this.http.post(baseUrl, params).pipe(catchError(this.handleError))
  }

  update(id, params) {
    return this.http.put(`${baseUrl}/${id}`, params).pipe(
      map((account: any) => {
        // update the current account if it was updated
        if (account.id === this.accountValue.id) {
          // publish updated account to subscribers
          account = { ...this.accountValue, ...account }
          this.accountSubject.next(account)
        }
        return account
      }),
      catchError(this.handleError),
    )
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(
      finalize(() => {
        // auto logout if the logged in account deleted their own record
        if (id === this.accountValue.id) this.logout()
      }),
      catchError(this.handleError),
    )
  }

  updateStatus(id: string, isActive: boolean) {
    return this.http.put<any>(`${baseUrl}/${id}/status`, { isActive }).pipe(
      map((account) => {
        // If we're updating the current user, update the subject
        if (account.id === this.accountValue.id) {
          // publish updated account to subscribers
          account = { ...this.accountValue, ...account }
          this.accountSubject.next(account)
        }
        return account
      }),
      catchError(this.handleError),
    )
  }

  // helper methods
  private handleError(error: HttpErrorResponse) {
    console.error("API error:", error)

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error("Client error:", error.error.message)
      return throwError(() => error.error.message || "Something went wrong. Please try again.")
    } else {
      // Server-side error
      console.error(`Backend returned code ${error.status}, body was:`, error.error)
      return throwError(() => error.error?.message || `Server error: ${error.status}`)
    }
  }

  private startRefreshTokenTimer() {
    try {
      // parse json object from base64 encoded jwt token
      const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split(".")[1]))

      // set a timeout to refresh the token a minute before it expires
      const expires = new Date(jwtToken.exp * 1000)
      const timeout = expires.getTime() - Date.now() - 60 * 1000

      // Make sure we don't set a negative timeout
      if (timeout > 0) {
        console.log(`Token refresh scheduled in ${Math.round(timeout / 1000)} seconds`)
        this.refreshTokenTimeout = setTimeout(() => {
          console.log("Refreshing token...")
          this.refreshToken().subscribe({
            next: () => console.log("Token refreshed successfully"),
            error: (error) => console.error("Token refresh failed:", error),
          })
        }, timeout)
      } else {
        // Token already expired, try to refresh immediately
        console.log("Token already expired, refreshing immediately")
        this.refreshToken().subscribe()
      }
    } catch (error) {
      console.error("Error starting token refresh timer:", error)
    }
  }

  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout)
      this.refreshTokenTimeout = null
    }
  }
}
