import { Component, OnInit, OnDestroy } from "@angular/core"
import { Router, NavigationStart } from "@angular/router"
import { Subscription } from "rxjs"

import { Alert, AlertType } from "@app/_models"
import { AlertService } from "@app/_services"

@Component({
    selector: 'alert',
    templateUrl: 'alert.component.html'
})
export class AlertComponent implements OnInit, OnDestroy {
    alerts: Alert[] = []
    alertSubscription!: Subscription
    routeSubscription!: Subscription

    constructor(
        private alertService: AlertService,
        private router: Router
    ) { }

    ngOnInit() {
        // subscribe to new alert notifications
        this.alertSubscription = this.alertService.onAlert()
            .subscribe(alert => {
                // clear alerts when an empty alert is received
                if (!alert.message) {
                    // filter out alerts without 'keepAfterRouteChange' flag
                    this.alerts = this.alerts.filter(x => x.keepAfterRouteChange)

                    // remove 'keepAfterRouteChange' flag on the rest
                    this.alerts.forEach(x => delete x.keepAfterRouteChange)
                    return
                }

                // add alert to array
                this.alerts.push(alert)

                // auto close alert if required
                if (alert.autoClose) {
                    setTimeout(() => this.removeAlert(alert), 3000)
                }
            })

        // clear alerts on location change
        this.routeSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.alertService.clear(event.url === "/account/login" ? undefined : event.url)
            }
        })
    }

    ngOnDestroy() {
        // unsubscribe to avoid memory leaks
        if (this.alertSubscription) {
            this.alertSubscription.unsubscribe()
        }
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe()
        }
    }

    removeAlert(alert: Alert) {
        // check if already removed to prevent error on auto close
        if (!this.alerts.includes(alert)) return

        // remove alert
        this.alerts = this.alerts.filter(x => x !== alert)
    }

    cssClass(alert: Alert) {
        if (!alert) return ''

        const classes = ['alert', 'alert-dismissable', 'mt-4', 'container']

        const alertTypeClass = {
            [AlertType.Success]: 'alert-success',
            [AlertType.Error]: 'alert-danger',
            [AlertType.Info]: 'alert-info',
            [AlertType.Warning]: 'alert-warning'
        }

        if (alert.type !== undefined) {
            classes.push(alertTypeClass[alert.type])
        }

        if (alert.fade) {
            classes.push('fade')
        }

        return classes.join(' ')
    }
}