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
import { CountryAllowedReferenceModel, CountryViewModel } from 'app/shared/models/financial/country-view.model';
import * as countriesData from '../../../../assets/json/tax.json';
import { CountryVehicle } from 'app/shared/models/reservation/country-vehicle.model';
import { CountryListItem } from 'app/shared/models/financial/country-list-item.model';

@Injectable()
export class CountryService extends BaseService {

  baseUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, private spinnerService: SpinnerOverlayService) {
    super();
    this.baseUrl = baseUrl;
  }

  createCountry(): CountryViewModel {
    return new CountryViewModel();
  }

  getCountries(pageNum: string, size: number) {
    var baseUrl = this.baseUrl + "api/country/get-list";

    let formData = {
      pageInfo: {
        index: Number(pageNum) - 1,
        size: size
      }
    }
    const headers = this.prepareHeaders();
    const options = { headers: headers };

    // return this.http.get('/assets/json/currency.json');

    return this.http.post<ListPageWrapper<CountryViewModel>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        const response: ListPageWrapper<CountryViewModel> = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
         return response;
      }),
        catchError(err => this.handleError(err)));
  }

  getCountryVehicles(countryUid: string): Observable<CountryVehicle[]> {
    var baseUrl = this.baseUrl + "api/country-vehicle-category-settings/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      countryUid: {
        op: "eq",       
        value: countryUid,
      },
      vehicleCategoryUid: {
        op: "eq",
        value: "8876d75b-4898-4140-93ae-448625b5f78e"
      }
    }
    return this.http.post<ListPageWrapper<CountryVehicle>>(baseUrl, formData, options)
    .pipe(map((res: any) => {
      const response: ListPageWrapper<CountryVehicle> = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
      return response.items;
    }))
  }

  getCountry(uid): any {
    var baseUrl = this.baseUrl + "api/country/get-details";
    const headers = this.prepareHeaders();
    const options = { headers: headers };

    // return this.http.get('/assets/json/currency.json');

    return this.http.post<any>(baseUrl, { uid }, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  saveCountry(item: CountryViewModel) {
    var baseUrl = this.baseUrl + "api/country";
    const headers = this.prepareHeaders();
    const options = {headers: headers};
    return this.http.post<CountryViewModel>(baseUrl, { data:[item] }, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  updateCountry(item: CountryViewModel) {
    var baseUrl = this.baseUrl + "api/country";
    const headers = this.prepareHeaders();
    const options = {headers: headers};
    const s = JSON.stringify(item);
    return this.http.put<any>(baseUrl, { data:[item] }, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  deleteCountry(country: CountryListItem) {
    var baseUrl = this.baseUrl + "api/country";
    const headers = this.prepareHeaders();
    let formData = {
      uid: country.uid,
      entityVersion: country.entityVersion
    }
    const options = { headers: headers, body: { data: [formData] } };
    return this.http.request<any>('delete', baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  getCountryAllowedReferecne(countryUid: string): Observable<CountryAllowedReferenceModel[]> {
    var baseUrl = this.baseUrl + "api/country-allowed-reference/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      countryUid: {
        op: "eq",
        value: countryUid
      }
    }
    return this.http.post<CountryAllowedReferenceModel[]>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        return res.data;
      }),
        catchError(err => this.handleError(err)));
  }

  addCountryAllowedReference(countryUid: string, countryReferenceUid: string) {
    var baseUrl = this.baseUrl + "api/country-allowed-reference";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      data: [
        {
          countryUid, countryReferenceUid
        }
      ]
    }
    return this.http.post<any>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        return res.data[0];
      }),
        catchError(err => this.handleError(err)));
  }

  deleteCountryAllowedReference(formData) {
    var baseUrl = this.baseUrl + "api/country-allowed-reference";
    const headers = this.prepareHeaders();
    const options = { headers: headers, body: formData };
    return this.http.request<any>('delete', baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  getCountryVehicleCategorySettings(countryUid: string) {
    var baseUrl = this.baseUrl + "api/country-vehicle-category-settings/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      countryUid: {
        op: "eq",
        countryUid: countryUid
      }
    }
    return this.http.post<any>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        return res.data;
      }),
        catchError(err => this.handleError(err)));
  }

  getCountryVehicleCategorySettingDetails(uid) {
    var baseUrl = this.baseUrl + "api/country-vehicle-category-settings/get-details";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<any>(baseUrl, { uid }, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  createCountryVehicleCategorySettingDetails(formData) {
    var baseUrl = this.baseUrl + "api/country-vehicle-category-settings";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<any>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        return res.data;
      }),
        catchError(err => this.handleError(err)));
  }

  updateCountryVehicleCategorySettingDetails(formData) {
    var baseUrl = this.baseUrl + "api/country-vehicle-category-settings";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put<any>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        return res.data;
      }),
        catchError(err => this.handleError(err)));
  }

}
