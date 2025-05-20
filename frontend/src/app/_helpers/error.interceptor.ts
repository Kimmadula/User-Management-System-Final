import { Injectable } from "@angular/core"
import type { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http"
import { type Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"

import type { AccountService } from "@app/_services"

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        console.log("Error interceptor caught:", err)

        if ([401, 403].includes(err.status) && this.accountService.accountValue) {
          // auto logout if 401 or 403 response returned from api
          this.accountService.logout()
        }

        // Get the error message
        const error = err.error?.message || err.statusText || "Unknown Error"

        // Log the error for debugging
        console.error("API Error:", error)

        return throwError(() => error)
      }),
    )
  }
}
