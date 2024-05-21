// Service for processing server-side calls, related to 

// Initially powered by Stantum Angular Utils.
// Want to dramatically increase your development speed too? Visit https://www.stantum.cz/development-automation

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/internal/operators/catchError";
import { map } from "rxjs/internal/operators/map";
import { BaseService } from '../../common/base.service';
import { ListPageWrapper } from '../../common/list-page-wrapper.model';
import { ReservationListItem } from '../../models/reservation/reservation-list-item.model';
import { SpinnerOverlayService } from "../spinner-overlay.service";
import { DateConverters } from '../system/date-converters.helper';
import { CurrencyViewModel } from 'app/shared/models/financial/currency-view.model';
import * as currencyData from '../../../../assets/json/currency.json';
import { CurrencyUpdateModel } from 'app/shared/models/financial/currency-update.model';
import { environment } from 'environments/environment';


@Injectable()
export class CurrencyService extends BaseService {

  baseUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, private spinnerService: SpinnerOverlayService) {
    super();
    this.baseUrl = environment.apiUrl;  
  }

  createCurrency(): CurrencyViewModel {
    return new CurrencyViewModel();
  }

  getCurrencies(pageNum: string, size: Number) {
    // var baseUrl = this.baseUrl + "api/reservation/page/" + pageNum + "?";
    var baseUrl = this.baseUrl + "api/currency/get-list"

    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: Number(pageNum)-1,
        size: size
      }
    }
    // return this.http.get('/assets/json/currency.json');

    return this.http.post<ListPageWrapper<CurrencyUpdateModel>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response;
      }),
        catchError(err => this.handleError(err)));
  }

  getCurrency(uid): any {
    const headers = this.prepareHeaders();
    const options = {headers: headers};
    return this.http.post<CurrencyViewModel>(this.baseUrl + 'api/currency/get-details', {uid}, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  saveCurrency(items: CurrencyViewModel[]) {
    const headers = this.prepareHeaders();
    const options = {headers: headers};
    return this.http.post<{data: CurrencyViewModel[]}>(this.baseUrl + 'api/currency/', { data: items }, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  updateCurrency(items: CurrencyViewModel[]) {
    const headers = this.prepareHeaders();
    const options = {headers: headers};
    return this.http.put<{data: CurrencyViewModel[]}>(this.baseUrl + 'api/currency/', { data: items }, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  deleteCurrency(currency) {
    const headers = this.prepareHeaders();
    let formData = {
      uid: currency.uid,
      entityVersion: currency.entityVersion
    }
    const options = { headers: headers, body: { data: [formData] } };
    return this.http.request( 'delete', this.baseUrl + 'api/currency', options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  getCurrencyHistory(uid, pageNum = 1): any {
    var baseUrl = this.baseUrl + "api/reservation/page/" + pageNum + "?";

    const headers = this.prepareHeaders();
    const options = { headers: headers };

    return this.http.get('/assets/json/currency_history.json');

    return this.http.get<ListPageWrapper<ReservationListItem>>(baseUrl, options)
      .pipe(map(res => {
         return res;
      }),
        catchError(err => this.handleError(err)));
  }
}
