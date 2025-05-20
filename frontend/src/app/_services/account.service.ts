import { Injectable } from "@angular/core"
import type { Router } from "@angular/router"
import type { HttpClient } from "@angular/common/http"
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
    return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true }).pipe(
      map((account) => {
        this.accountSubject.next(account)
        this.startRefreshTokenTimer()
        return account
      }),
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
    )
  }

  register(account: any) {
    console.log("Registering account:", account)

    // Add error handling and logging
    return this.http.post(`${baseUrl}/register`, account).pipe(
      tap((response) => console.log("Registration response:", response)),
      catchError((error) => {
        console.error("Registration HTTP error:", error)

        // If it's a network error or server error, provide a clearer message
        if (error.status === 0) {
          return throwError(() => ({
            error: { message: "Unable to connect to the server. Please check your internet connection." },
          }))
        }

        // Pass through the error for component handling
        return throwError(() => error)
      }),
    )
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token })
  }

  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/forgot-password`, { email })
  }

  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token })
  }

  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword })
  }

  getAll() {
    return this.http.get<Account[]>(baseUrl)
  }

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`)
  }

  create(params) {
    return this.http.post(baseUrl, params)
  }

  update(id, params) {
    return this.http.put(`${baseUrl}/${id}`, params).pipe(
      map((account: any) => {
        // update the current account if it was updated
        if (account.id === this.accountValue?.id) {
          // publish updated account to subscribers
          account = { ...this.accountValue, ...account }
          this.accountSubject.next(account)
        }
        return account
      }),
    )
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(
      finalize(() => {
        // auto logout if the logged in account was deleted
        if (id === this.accountValue?.id) this.logout()
      }),
    )
  }

  // Add the missing updateStatus method
  updateStatus(id: string, isActive: boolean) {
    return this.http.put<any>(`${baseUrl}/${id}/status`, { isActive }).pipe(
      map((account) => {
        // If we're updating the current user, update the subject
        if (account.id === this.accountValue?.id) {
          // publish updated account to subscribers
          account = { ...this.accountValue, ...account }
          this.accountSubject.next(account)
        }
        return account
      }),
    )
  }

  // helper methods
  private startRefreshTokenTimer() {
    try {
      // parse json object from base64 encoded jwt token
      const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split(".")[1]))

      // set a timeout to refresh the token a minute before it expires
      const expires = new Date(jwtToken.exp * 1000)
      const timeout = expires.getTime() - Date.now() - 60 * 1000
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout)
    } catch (error) {
      console.error("Error starting refresh token timer:", error)
    }
  }

  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout)
      this.refreshTokenTimeout = null
    }
  }
}
