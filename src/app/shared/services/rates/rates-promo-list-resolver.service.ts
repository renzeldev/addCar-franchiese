// Resolver service for FranchiseeViewModel

// Initially powered by Stantum Angular Utils.
// Want to dramatically increase your development speed too? Visit https://www.stantum.cz/development-automation

import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

import { SpinnerOverlayService } from '../spinner-overlay.service';
import { RatesService } from './rates.service';
import { RatesPromoDetailModel } from 'app/shared/models/rates/rates-promo-view.model';

@Injectable()
export class RatesPromoListResolverService implements Resolve<RatesPromoDetailModel[]> {
    constructor(
        private service: RatesService,
        private spinnerService: SpinnerOverlayService,
    ) { }

    resolve(
        route: ActivatedRouteSnapshot,
    ): RatesPromoDetailModel[] | Observable<RatesPromoDetailModel[]> | Observable<never> {
        let formData = {
            pageInfo: {
                index: 0,
                size: 999
            }
        }
        return this.service.getPromoList(formData).pipe(
            catchError(() => {
                this.spinnerService.hide();
                return EMPTY;
            }),
            mergeMap((something) => {
                if (something) {
                    this.spinnerService.hide();
                    return of(something);
                } else {
                    this.spinnerService.hide();
                    return EMPTY;
                }
            })
        )
    }
}
