// Service for processing server-side calls, related to 

// Initially powered by Stantum Angular Utils.
// Want to dramatically increase your development speed too? Visit https://www.stantum.cz/development-automation

import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/internal/operators/catchError";
import { map } from "rxjs/internal/operators/map";
import { BaseService } from '../../common/base.service';
import { ListPageWrapper } from '../../common/list-page-wrapper.model';
import { ReservationListItem } from '../../models/reservation/reservation-list-item.model';
import { SpinnerOverlayService } from "../spinner-overlay.service";
import { DateConverters } from '../system/date-converters.helper';
import { RatesViewModel } from 'app/shared/models/rates/rates-view.model';
import * as jsonData from '../../../../assets/json/rates.json';
import * as definitionData from '../../../../assets/json/rates_extra_definitions.json';
import { RatesExtraDetailViewModel } from 'app/shared/models/rates/rates-extra-detail-view.model';
import { RatesListItem } from 'app/shared/models/rates/rates-list-item.model';
import { RateCreateModel, RateDetailsModel, RateListModel, RateUpdateModel } from 'app/shared/models/rates/rates-item-detail.model';
import { ExtrasCreateModel, ExtrasListModel, ExtrasUpdateModel } from 'app/shared/models/rates/estras-list-model';
import { environment } from 'environments/environment';
import { RateSeasonDayBreakDetailsModel, RateSeasonDetailsModel, RateSeasonExcessListModel, RateSeasonExcessValueDetailsModel, RateSeasonExtrasListModel, RateSeasonExtrasValueDetailsModel, RateSeasonValueDetailsModel } from 'app/shared/models/rates/rates-season-view.model';
import { VehicleCategoryDetailModel, VehicleModel } from 'app/shared/models/rates/vehicle-category-model';
import { BehaviorSubject, Subject } from 'rxjs';
import { RatesPromoDetailModel, RatesPromoViewModel } from 'app/shared/models/rates/rates-promo-view.model';
import { GroupViewModel } from 'app/shared/models/financial/group-view.model';
import { GroupListItem } from 'app/shared/models/financial/group-list-item.model';
import { AvailableVehicle } from 'app/shared/models/rates/vehicle-available.model';

@Injectable()
export class RatesService extends BaseService {

  private rateSeasonExtraSubject = new Subject<any>();
  private extraDecoratorSubject = new Subject<any>();
  private rateSeasonValuesSubject = new Subject<any>();
  private rateSeasonExcessSubject = new Subject<any>();
  private rateSeasonGridSubject = new Subject<any>();
  private removeRateSeasonSubject = new Subject<any>();
  private changeRateTabSubject = new Subject<any>();
  private changedSeasonSubject = new Subject<any>();
  private gridChangedSubject = new Subject<any>();
  private newSippCodeSignalSubject = new Subject<any>();
  private updatedSippCodeUid = new Subject<any>();
  private registeredVehicleCategories = new Subject<any>();
  private selectRateSeasonSubject = new Subject<any>();
  private createRateSeasonSubject = new Subject<any>();
  private deleteRateSeasonSubject = new Subject<any>();
  private allRateSeasonSubject = new Subject<any>();
  private cancelRateSeasonSubject = new Subject<any>();
  private createExtraSubject = new Subject<any>();
  private editingRowStatus = new Subject<any>();
  private selectedSippGridSubject = new Subject<any>();

  baseUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, private spinnerService: SpinnerOverlayService) {
    super();
    this.baseUrl = environment.apiUrl;
  }

  createCurrency(): RatesViewModel {
    return new RatesViewModel();
  }

  sendChangeRatesTabSubject() {
    return this.changeRateTabSubject.next("");
  }

  getChangeRatesTabSubject() {
    return this.changeRateTabSubject;
  }

  //RxJS functions
  sendRateExtrasSubject(data: any) {
    return this.rateSeasonExtraSubject.next(data);
  }

  getExtraObservable() {
    return this.rateSeasonExtraSubject;
  }

  sendSeasonGridSubject(data: any) {
    return this.rateSeasonGridSubject.next(data);
  }

  getSeasonGridObservable() {
    return this.rateSeasonGridSubject;
  }

  sendExtraDecoratorProtoType(data: any) {
    return this.extraDecoratorSubject.next(data);
  }

  getExtraDecoratorObservable() {
    return this.extraDecoratorSubject;
  }

  sendRateSeasonValuesSubject(data: any) {
    return this.rateSeasonValuesSubject.next(data);
  }

  getRateSeasonValuesSubject() {
    return this.rateSeasonValuesSubject;
  }

  sendRateSeasonExcessSubject(data: any) {
    return this.rateSeasonExcessSubject.next(data);
  }

  getRateSeasonExcessSubject() {
    return this.rateSeasonExcessSubject;
  }

  sendRemoveRateSeasonSubject(data: any) {
    return this.removeRateSeasonSubject.next(data);
  }

  getRemoveRateSeasonSubject() {
    return this.removeRateSeasonSubject;
  }

  sendChangedRateSeasonSubject(data: any) {
    return this.changedSeasonSubject.next(data);
  }

  getChangedRateSeasonSubject() {
    return this.changedSeasonSubject;
  }

  sendGridChangedSubject(changedGrid) {
    return this.gridChangedSubject.next(changedGrid);
  }

  getGridChangedSubject() {
    return this.gridChangedSubject;
  }

  sendNewSippCodeSignalSubject(data) {
    return this.newSippCodeSignalSubject.next(data);
  }

  getNewSippCodeSignalSubjet() {
    return this.newSippCodeSignalSubject;
  }

  sendUpdatedSippCodeUid(updatedSippInfo: {uid: string, value: number}) {
    return this.updatedSippCodeUid.next(updatedSippInfo)
  }

  getUpdatedSippCodeUid() {
    return this.updatedSippCodeUid;
  }

  sendRegisteredVehicleCategories(data) {
    return this.registeredVehicleCategories.next(data);
  }

  getRegisteredVehicleCategories() {
    return this.registeredVehicleCategories;
  }

  sendSelectRateSeasonSubject(data) {
    return this.selectRateSeasonSubject.next(data);
  }

  getSelectRowDataSubject() {
    return this.selectRateSeasonSubject;
  }

  sendCreateRateSeasonSubject(data) {
    return this.createRateSeasonSubject.next(data);
  }

  getCreateRowDataSubject() {
    return this.createRateSeasonSubject;
  }

  sendDeleteRateSeasonSubject(data) {
    return this.deleteRateSeasonSubject.next(data);
  }

  getDeleteRateSeasonSubject() {
    return this.deleteRateSeasonSubject;
  }

  getRowDataSubject() {
    return this.deleteRateSeasonSubject;
  }

  getAllRateSeasonSubject() {
    return this.allRateSeasonSubject;
  }

  sendCancelRateSeasonSubject(data) {
    return this.cancelRateSeasonSubject.next(data);
  }

  getCancelRowDataSubject() {
    return this.cancelRateSeasonSubject;
  }

  sendCreateExtraSubject() {
    return this.createExtraSubject.next("Create Extra");
  }

  getCreateExtraSubject() {
    return this.createExtraSubject;
  }
  
  sendRowEditingStatus(data) {
    return this.editingRowStatus.next(data);
  }

  getRowEditingStatus() {
    return this.editingRowStatus
  }

  sendSelectedSippGridSubject(data) {
    return this.selectedSippGridSubject.next(data);
  }

  getSelectedSippGridSubject() {
    return this.selectedSippGridSubject
  }

  //[GET]/api/rates
  getRates(pageNum: number): Observable<ListPageWrapper<any>> {
    // var baseUrl = this.baseUrl + "api/reservation/rates/" + pageNum + "?";
    var baseUrl = this.baseUrl + `api/rates?pageSize=20&pageIndex=${pageNum - 1}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.get<ListPageWrapper<RateListModel> | Observable<any> | Observable<never>>(baseUrl, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        // return response;
        return response;
      }),
        catchError(err => this.handleError(err)));
  }

  getList(data): Observable<any> {
    let headers = this.prepareHeaders();

    let url = this.baseUrl + "api/rate/get-list";

    //headers
    return this.http.post<ListPageWrapper<RateListModel> | Observable<any> | Observable<never>>(url, data, { headers })
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        // return response;
        return response;
      }),
        catchError(err => this.handleError(err)));
  }

  //[POST]/api/rates/
  saveRates(newRate: RateCreateModel): Observable<RateDetailsModel> {
    var baseUrl = this.baseUrl + `api/rate`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<RateDetailsModel>(baseUrl, { data: [newRate] }, options)
      .pipe(map((res: RateDetailsModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[PUT]/api/rates/
  updateRates(rate: RateDetailsModel): Observable<RateDetailsModel> {
    var baseUrl = this.baseUrl + `api/rate`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put<RateDetailsModel>(baseUrl, { data: [rate] }, options)
      .pipe(map((res: RateDetailsModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[GET]/api/rates/{uid}
  getRatesDetail(uid): Observable<RateDetailsModel> {
    var baseUrl = this.baseUrl + `api/rate/get-details`;
    const headers = this.prepareHeaders();
    const options = { headers: headers};
    let formData = {
      uid: uid
    }
    // return of(jsonData['items'][0]);
    return this.http.post<RateDetailsModel>(baseUrl, formData, options)
      .pipe(map(res => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[PUT]/api/rates/{uid}
  updateRatesDetail(updateRate: RateUpdateModel, uid): Observable<any> {
    var baseUrl = this.baseUrl + `api/rates/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers, params: { uid: uid } };
    return this.http.put<any>(baseUrl, updateRate, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[DELETE]/api/rates/{uid}
  deleteRates(data) {
    var baseUrl = this.baseUrl + `api/rate`;
    const headers = this.prepareHeaders();
    const options = { headers: headers, body: data };
    return this.http.request<any>("delete", baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[DELETE]/api/rates/{uid}/force
  deleteRatesForce(uid, deletedData) {
    var baseUrl = this.baseUrl + `api/rates/${uid}/force`;
    const headers = this.prepareHeaders();
    const options = { headers: headers, body: deletedData };
    return this.http.request<any>('delete', baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  getRatesDetailExcess(page, uid) {
    return this.http.get('/assets/json/rates_excess.json');
  }


  //[GET]/api/extras
  // getExtras(page: number) {
  //   var baseUrl = this.baseUrl + `api/extras/?pageSize=10&pageIndex=${page-1}`;
  //   const headers = this.prepareHeaders();
  //   const options = { headers: headers };

  //   // return this.http.get('/assets/json/rates_extra.json'); 
  //   return this.http.get<ListPageWrapper<ExtrasListModel> | Observable<any> | Observable<never>>(baseUrl, options)
  //   .pipe(map((res: any) => {
  //     const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
  //     return response;
  //   }),
  //   catchError(err => this.handleError(err)));
  // }

  //------------------------------Extras------------------------------//

  getExtras(pageInfo) {
    var baseUrl = this.baseUrl + "api/extras/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };

    // return this.http.get('/assets/json/rates_extra.json'); 
    return this.http.post<ListPageWrapper<ExtrasListModel> | Observable<any> | Observable<never>>(baseUrl, pageInfo, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response;
      }),
        catchError(err => this.handleError(err)));
  }

  //[POST]/api/extras
  saveExtra(item: ExtrasCreateModel) {
    var baseUrl = this.baseUrl + `api/extras/`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<ExtrasListModel>(baseUrl, item, options)
      .pipe(map((res: ExtrasListModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[DELETE]/api/extras/{uid}
  removeExtra(uid, entityVersion) {
    var baseUrl = this.baseUrl + `api/extras/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers, body: { entityVersion: entityVersion } };
    return this.http.request<any>("delete", baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[GET]/api/extras/{uid}
  getExtraDetail(uid): Observable<ExtrasListModel> {
    var baseUrl = this.baseUrl + `api/extras/get-details`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      uid: uid
    }
    return this.http.post<ExtrasListModel>(baseUrl, formData, options)
      .pipe(map((res: ExtrasListModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[PUT]/api/extras/{uid}
  updateExtraDetail(uid, updatedExtra): Observable<ExtrasUpdateModel> {
    var baseUrl = this.baseUrl + `api/extras/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers, params: { uid: uid } };
    return this.http.put<ExtrasListModel>(baseUrl, options)
      .pipe(map((res: ExtrasListModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  getRatesExtraDefinitions(uid) {
    return of(definitionData);
    // return this.http.get('/assets/json/rates_extra.json'); 
  }

  //-------------------------Excess----------------------------//

  getExcesses(pageInfo) {
    var baseUrl = this.baseUrl + "api/excess/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };

    // return this.http.get('/assets/json/rates_extra.json'); 
    return this.http.post<ListPageWrapper<ExtrasListModel> | Observable<any> | Observable<never>>(baseUrl, pageInfo, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response.items;
      }),
        catchError(err => this.handleError(err)));
  }

  saveCurrency(item: RatesViewModel) {
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    const s = JSON.stringify(item);
    return of(item);
    return this.http.post<RatesViewModel>(this.baseUrl + 'api/franchisee/', s, options).pipe(
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

    return this.http.get('/assets/json/rates.json');

    return this.http.get<ListPageWrapper<ReservationListItem>>(baseUrl, options)
      .pipe(map(res => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }


  //[GET]/api/rates/{rateUid}/seasons
  getRateSeasons(rateUid): Observable<any[]> {
    var baseUrl = this.baseUrl + 'api/rate-season/get-list'
    // var baseUrl = this.baseUrl + `api/rates/${rateUid}/seasons`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    const formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateUid: {
        op: "eq",
        value: rateUid
      }
    }
    return this.http.post<ListPageWrapper<RateListModel> | Observable<any> | Observable<never>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        let items = response.items;
        items.map((item: any) => {
          item.bookingStartDate = item.bookingStartDate ? item.bookingStartDate.split('T')[0] : '';
          item.bookingEndDate = item.bookingEndDate ? item.bookingEndDate.split('T')[0] : '';
        })
        return items;
      }),
        catchError(err => this.handleError(err)));
  }

  //[POST]/api/rates/{rateUid}/seasons
  saveRateSeason(newRowData): Observable<RateSeasonDetailsModel> {
    var baseUrl = this.baseUrl + `api/rate-season`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<RateSeasonDetailsModel>(baseUrl, { data: newRowData }, options)
      .pipe(map((res: RateSeasonDetailsModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[GET]/api/rates/seasons/{uid}
  getRateSeason(uid): Observable<RateSeasonDetailsModel> {
    var baseUrl = this.baseUrl + `api/rates/seasons/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.get<RateSeasonDetailsModel>(baseUrl, options)
      .pipe(map((res: RateSeasonDetailsModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[PUT]/api/rates/seasons/{uid}
  updateRateSeason(updatedRowData): Observable<RateSeasonDetailsModel> {
    var baseUrl = this.baseUrl + `api/rate-season`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put<RateSeasonDetailsModel>(baseUrl, { data: updatedRowData }, options)
      .pipe(map((res: RateSeasonDetailsModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  deleteRateSeason(uid, entityVersion): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season`;
    const headers = this.prepareHeaders();
    if(entityVersion === undefined) {
      return of(true);
    }
    const options = { headers: headers, body: {data: [{ entityVersion: entityVersion, uid: uid }]} };
    return this.http.request<any>('delete', baseUrl, options)
      .pipe(map((res: any) => {
        return true;
      }),
        catchError(err => this.handleError(err)));
  }

  //[DELETE]/api/rates/seasons/{uid}
  // deleteRateSeason(uid, entityVersion): Observable<any> {
  //   var baseUrl = this.baseUrl + `api/rates/seasons/${uid}`;
  //   const headers = this.prepareHeaders();
  //   if(entityVersion === undefined) {
  //     return of(true);
  //   }
  //   const options = { headers: headers, params: { uid: uid }, body: { entityVersion: entityVersion, uid: uid } };
  //   return this.http.request<any>('delete', baseUrl, options)
  //     .pipe(map((res: any) => {
  //       return res;
  //     }),
  //       catchError(err => this.handleError(err)));
  // }

  //[DELETE]/api/rates/seasons/{uid}/force
  deleteForceRateSeason(uid, entityVersion): Observable<any> {
    var baseUrl = this.baseUrl + `api/rates/seasons/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers, params: { uid: uid }, body: { entityVersion: entityVersion } };
    return this.http.request<any>('delete', baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //---------------------------------------------Season Day Breaks API--------------------------------//
  //[GET]/api/rates/seasons/{seasonUid}/day-breaks
  getRateSeasonDayBreaks(rateUid): Observable<any> {
    // var baseUrl = this.baseUrl + `api/rates/seasons/${seasonUid}/day-breaks`;
    var baseUrl = this.baseUrl + "api/rate-day-break/get-list"
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    const formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateUid: {
        op: "eq",
        value: rateUid
      }
    }
    return this.http.post<ListPageWrapper<RateSeasonDayBreakDetailsModel> | Observable<any> | Observable<never>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response;
      }),
        catchError(err => this.handleError(err)));
  }

  //[GET]/api/rates/seasons/day-breaks/{uid}
  getRateSeasonDayBreak(uid): Observable<any> {
    var baseUrl = this.baseUrl + `api/rates/seasons/day-breaks/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.get<any>(baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  createRateSeasonDayBreak(data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-day-break`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      data: data
    }
    return this.http.post<any>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        return res.data;
      }),
        catchError(err => this.handleError(err)));
  }

  deleteRateSeasonDayBreak(data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-day-break`;
    const headers = this.prepareHeaders();
    let formData = {
      data: [data],
      force: true
    }
    const options = { headers: headers, body: formData };
    return this.http.request<any>('delete', baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  updateRateSeasonDayBreak(data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-day-break`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      data: data
    }
    return this.http.put<any>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        return res.data;
      }),
        catchError(err => this.handleError(err)));
  }

  //----------------------------------------------Rate Season Values API-------------------------------//
  //[GET]/api/rates/seasons/{seasonId}/values
  getRateSeasonValues(formData): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-value/get-list`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<ListPageWrapper<RateSeasonValueDetailsModel> | Observable<any> | Observable<never>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response.items;
      }),
        catchError(err => this.handleError(err)));
  }

  updateRateSeasonValues(data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-value`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      data: data
    }
    return this.http.put<ListPageWrapper<RateSeasonValueDetailsModel> | Observable<any> | Observable<never>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        return res.data;
      }),
        catchError(err => this.handleError(err)));
  }

  // deleteRateSeasonVehicle(data): Observable<any> {
  //   var baseUrl = this.baseUrl + 'api/rate-season-vehicle-category'
  //   const headers = this.prepareHeaders();
  //   const options = { headers: headers };
  //   let formData = {
  //     data: [data]
  //   }
  //   return this.http.delete<any>(baseUrl, )
  // }

  getRateSeasonValue(uid: string): Observable<any> {
    var baseUrl = this.baseUrl + `api/rates/seasons/values/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.get<any>(baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[PUT]/api/rate-season-value
  updateRateSeasonValue(data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-value`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put<any>(baseUrl, data, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  // deleteRateSeasonValue(uid, entityVersion) {
  //   var baseUrl = this.baseUrl + `api/rates/seasons/values/${uid}`;
  //   const headers = this.prepareHeaders();
  //   const options = { headers: headers, params: { uid: uid }, body: { entityVersion: entityVersion, uid: uid } };
  //   return this.http.request<any>('delete', baseUrl, options)
  //     .pipe(map((res: any) => {
  //       return res;
  //     }),
  //       catchError(err => this.handleError(err)));
  // }

  //---------------------------------------------Season Excess API------------------------------------//
  //[GET]/api/rates/seasons/{seasonUid}/excess
  getRateSeasonExcess(seasonUid): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-excess/get-list`;
    let body = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateSeasonUid: {
        op: "eq",
        value: seasonUid
      }
    }
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<ListPageWrapper<RateSeasonExcessListModel> | Observable<any> | Observable<never>>(baseUrl, body, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response.items;
      }),
        catchError(err => this.handleError(err)));
  }

  //---------------------------------------------Season Extra API------------------------------------//
  //[GET]/api/rates/seasons/{seasonUid}/extras

  getRateSeasonExtra(seasonUid): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-extras/get-list`;
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateSeasonUid: {
        op: "eq",
        value: seasonUid
      }
    }
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<ListPageWrapper<RateSeasonExtrasListModel> | Observable<any> | Observable<never>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response.items;
      }),
        catchError(err => this.handleError(err)));
  }

  createRateSeasonExtra(data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-extras`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<RateSeasonExtrasListModel>(baseUrl, data, options)
      .pipe(map((res: RateSeasonExtrasListModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[PUT]/api/rates/seasons/extras/{uid}
  updateRateSeasonExtra(data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-extras-value`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      data: data
    }
    return this.http.put<any>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        return res.data;
      }),
        catchError(err => this.handleError(err)));
  }

  //----------------------------------------------Vehicle Categories API-------------------------------//
  //[GET]/api/vehicle-categories
  getVehicles(index, size, filter?): Observable<any> {
    var baseUrl = this.baseUrl + `api/vehicle-category/get-list`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: index,
        size: size
      }
    }
    if(filter) {
      formData['keywords'] = filter;
      formData['code'] = {
        op: 'eq',
        value: filter
      }
    }
    return this.http.post<ListPageWrapper<GroupListItem> | Observable<any> | Observable<never>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response;
      }),
        catchError(err => this.handleError(err)));
  }

  getVehicle(uid) {
    var baseUrl = this.baseUrl + `api/vehicle-category/get-details`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<GroupViewModel>(baseUrl, {uid}, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  updateVehicle(data) {
    var baseUrl = this.baseUrl + `api/vehicle-category`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put<any>(baseUrl, { data: [data] }, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  createVehicle(data) {
    var baseUrl = this.baseUrl + `api/vehicle-category`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<any>(baseUrl, { data: [data] }, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  deleteVehicle(group: GroupListItem) {
    var baseUrl = this.baseUrl + `api/vehicle-category`;
    const headers = this.prepareHeaders();
    let formData = {
      uid: group.uid,
      entityVersion: group.entityVersion
    }
    const options = { headers: headers, body: { data: [ formData ] } };
    return this.http.request<any>('delete', baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }


  //--------------------------------------------------Extra Values API----------------------------------//
  //[GET]/api/rates/seasons/{seasonUid}/extra-values
  getRateSeasonExtraValues(seasonUid): Observable<any> {

    var baseUrl = this.baseUrl + `api/rate-season-extras-value/get-list`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateSeasonUid: {
        op: "eq",
        value: seasonUid
      },
    }
    return this.http.post<ListPageWrapper<RateSeasonExtrasValueDetailsModel> | Observable<any> | Observable<never>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response.items;
      }),
        catchError(err => this.handleError(err)));
  }

  //[GET]/api/rates/seasons/extras-values/{uid}
  getRateSeasonExtraValue(uid): Observable<any> {
    var baseUrl = this.baseUrl + `api/rates/seasons/extras-values/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.get<any>(baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[PUT]/api/rates/seasons/extras-values/{uid}
  updateRateSeasonExtraValue(uid, data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rates/seasons/extras-values/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put<any>(baseUrl, data, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  deleteRateSeasonExtras(formData): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-extras`;
    const headers = this.prepareHeaders();
    const options = { headers: headers, body: formData };
    return this.http.request<any>('delete', baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //---------------------------------------------------Excess Values API---------------------------------//
  //[GET]/api/rates/seasons/{seasonUid}/excess-values
  getRateSeasonExcessValues(seasonUid): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-excess-value/get-list`;
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateSeasonUid: {
        op: "eq",
        value: seasonUid
      },
    }
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<ListPageWrapper<RateSeasonExcessValueDetailsModel> | Observable<any> | Observable<never>>(baseUrl, formData, options)
      .pipe(map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response.items;
      }),
        catchError(err => this.handleError(err)));
  }

  createRateSeasonExcess(data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-excess`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<RateSeasonExtrasListModel>(baseUrl, data, options)
      .pipe(map((res: RateSeasonExtrasListModel) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  deleteRateSeasonExcess(formData): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-excess`;
    const headers = this.prepareHeaders();
    const options = { headers: headers, body: formData };
    return this.http.request<any>('delete', baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }
  //[GET/api/rates/seasons/excess-values/{uid}
  getRateSeasonExcessValue(uid): Observable<any> {
    var baseUrl = this.baseUrl + `api/rates/seasons/excess-values/${uid}`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.get<any>(baseUrl, options)
      .pipe(map((res: any) => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  //[PUT]/api/rate-season-excess-value
  updateRateSeasonExcessValue(data): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-season-excess-value`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put<any>(baseUrl, data, options)
      .pipe(map((res: any) => {
        return res.data;
      }),
        catchError(err => this.handleError(err)));
  }

  //------------------------------RateSeasonVehicleCategory---------------------//


  //[POST]/api/rate-season-vehicle-category/get-list
  getAllVehicleCategory(uid): Observable<any> {
    var baseUrl = this.baseUrl + "api/rate-season-vehicle-category/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateSeasonUid: {
        op: "eq",
        value: uid
      }
    }
    return this.http.post<ListPageWrapper<VehicleCategoryDetailModel> | Observable<any> | Observable<never>>(baseUrl, formData, options)
    .pipe(map((res: any) => {
      const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
      return response.items;
    }),
      catchError(err => this.handleError(err)));
  }

  createNewVehicleCategory(data): Observable<any> {
    var baseUrl = this.baseUrl + "api/rate-season-vehicle-category";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<any>(baseUrl, data, options)
    .pipe(map((res: any) => {
      return res.data[0];
    }),
      catchError(err => this.handleError(err)));
  }

  deleteVehicleCategory(formData): Observable<any> {
    var baseUrl = this.baseUrl + "api/rate-season-vehicle-category";
    const headers = this.prepareHeaders();
    const options = { headers: headers, body: { data: formData, force: true} };
    return this.http.delete<any>( baseUrl, options)
    .pipe(map((res: any) => {
      return res;
    }), 
    catchError(err => this.handleError(err)));
  }

  //-----------------------Promo API--------------------------//
  getPromoList(formData): Observable<any> {
    var baseUrl = this.baseUrl + "api/promo/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<ListPageWrapper<RatesPromoDetailModel> | Observable<any> | Observable<never>>(baseUrl, formData, options)
    .pipe(map((res: any) => {
      const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
      return response.items;
    }),
      catchError(err => this.handleError(err)));
  }

  createPromo(formData): Observable<any> {
    var baseUrl = this.baseUrl + "api/promo";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<any>(baseUrl, formData, options)
    .pipe(map((res: any) => {
      return res.data[0];
    }),
      catchError(err => this.handleError(err)));
  }

  updatePromo(formData): Observable<any> {
    var baseUrl = this.baseUrl + "api/promo";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put<any>(baseUrl, formData, options)
    .pipe(map((res: any) => {
      return res.data[0];
    }),
      catchError(err => this.handleError(err)));
  }

  deletePromo(formData): Observable<any> {
    var baseUrl = this.baseUrl + "api/promo";
    const headers = this.prepareHeaders();
    const options = { headers: headers, body: formData };
    return this.http.request<any>('delete', baseUrl, options)
    .pipe(map((res: any) => {
      return res;
    }),
      catchError(err => this.handleError(err)));
  }


  //------------------Allotment API-------------------------//

  getAvailableVehicles(vehicleCategoryUid?: string, locationUid?: string): Observable<AvailableVehicle[]> {
    var baseUrl = this.baseUrl + "api/vehicle-availability/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      }
    }
    if(vehicleCategoryUid) {
      formData['vehicleCategoryUid'] = {
        op: "eq",
        value: vehicleCategoryUid
      }
    }
    if(locationUid) {
      formData['locationUid'] = {
        op: "eq",
        value: locationUid
      }
    }
    return this.http.post<Observable<AvailableVehicle[]>>(baseUrl, formData, options)
    .pipe(map((res: any) => {
      return res.data;
    }),
    catchError((err: any) => this.handleError(err)))
  }

  createAvailableVehicle(data) {
    var baseUrl = this.baseUrl + "api/vehicle-availability";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<any>(baseUrl, { data: [data] }, options)
    .pipe(map((res: any) => {
      return res.data[0];
    }),
      catchError(err => this.handleError(err)));
  }

  deleteAvailableVehicle(uid, entityVersion) {
    var baseUrl = this.baseUrl + `api/vehicle-availability`;
    const headers = this.prepareHeaders();
    const options = { headers: headers, body: { data: [{ uid, entityVersion }], force: true } };
    return this.http.request<any>('delete', baseUrl, options)
    .pipe(map((res: any) => {
      return res;
    }),
      catchError(err => this.handleError(err)));
  }
}


//
