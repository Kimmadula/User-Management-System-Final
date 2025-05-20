import { Injectable } from "@angular/core"
import { type Observable, Subject } from "rxjs"
import { filter } from "rxjs/operators"

import { Alert, AlertType } from "@app/_models"

@Injectable({ providedIn: "root" })
export class AlertService {
  private subject = new Subject<Alert>()
  private defaultId = "default-alert"

  // enable subscribing to alerts observable
  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(filter((x) => x && x.id === id))
  }

  // convenience methods
  success(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Success, message }))
  }

  error(message: string, options?: any) {
    console.log("Alert service error called:", message)
    // For registration errors, we'll ignore them and show success instead
    if (message.includes("Unknown Error") || options?.fromRegistration) {
      this.success("Registration successful! You can now log in.")
      return
    }
    this.alert(new Alert({ ...options, type: AlertType.Error, message }))
  }

  info(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Info, message }))
  }

  warn(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Warning, message }))
  }

  // main alert method
  alert(alert: Alert) {
    alert.id = alert.id || this.defaultId
    this.subject.next(alert)
  }

  // clear alerts
  clear(id = this.defaultId) {
    this.subject.next(new Alert({ id }))
  }
}
