// Service for processing server-side calls, related to BrokerViewModel

// Initially powered by Stantum Angular Utils.
// Want to dramatically increase your development speed too? Visit https://www.stantum.cz/development-automation

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { BaseService } from '@app-shared/common/base.service';
import { ListPageWrapper } from '@app-shared/common/list-page-wrapper.model';
import { BrokerItem, BrokerListItem, RateBrokerItem } from '@app-shared/models/broker-list-item.model';
import { BrokerShortListItem } from '@app-shared/models/broker-short-list-item.model';
import { BrokerViewModel } from '@app-shared/models/broker-view-model.model';
import { SpinnerOverlayService } from '../spinner-overlay.service';
import { RentalAgreementListItem } from '../../models/statement/rental-agreement-list-item.model';
import { UnbilledReservationListItem } from '../../models/reservation/unbilled-reservation-list-item.model';

@Injectable()
export class BrokerService extends BaseService {
  baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') baseUrl: string,
    private spinnerService: SpinnerOverlayService,
  ) {
    super();
    this.baseUrl = baseUrl;
  }

  createBroker(): BrokerViewModel {
    return new BrokerViewModel();
  }

  getBroker(uID: string): Observable<BrokerViewModel> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.get<BrokerViewModel>(this.baseUrl + 'api/broker/' + uID, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  saveBroker(item: BrokerViewModel): Observable<BrokerViewModel> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<BrokerViewModel>(this.baseUrl + 'api/broker/', item, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  // getBrokers(pageNum: number, searchText: string, hideNoInvoices: boolean = false, canHaveInvoices = false): Observable<ListPageWrapper<BrokerListItem>> {
  //   const headers = this.prepareHeaders();
  //   const options = { headers: headers };

  //   let query = "?";
  //   query = query + ((searchText) ? "searchText=" + encodeURI(searchText) : "") + "&";
  //   if (hideNoInvoices)query = query + "hideNoInvoices=" + hideNoInvoices + "&";
  //   if (canHaveInvoices)query = query + "canHaveInvoices=" + canHaveInvoices;

  //   return this.http
  //     .get<ListPageWrapper<BrokerListItem>>(`${this.baseUrl}api/broker/page/${pageNum}${query}`, options)
  //     .pipe(
  //       map((res) => {
  //         return res;
  //       }),
  //       catchError((err) => this.handleError(err)),
  //     );
  // }

  getBrokers(): Observable<any> {
    var baseUrl = this.baseUrl + "api/broker/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      }
    }
    return this.http.post<ListPageWrapper<BrokerItem>|ListPageWrapper<never>>(baseUrl, formData, options)
    .pipe(map((res: any) => {
      const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
      return response.items;
    }),
    catchError(err => this.handleError(err)))
  }

  addRateBroker(rateUid, brokerUid) {
    var baseUrl = this.baseUrl + "api/rate-broker";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      data: [
        { rateUid, brokerUid }
      ]
    }
    return this.http.post<Observable<any>>(baseUrl, formData, options)
    .pipe(map((res: any) => {
      return res.data[0];
    }),
    catchError(err => this.handleError(err)))
  }

  deleteRateBroker(uid, entityVersion) {
    var baseUrl = this.baseUrl + "api/rate-broker";
    const headers = this.prepareHeaders();
    let formData = {
      data: [
        { uid, entityVersion }
      ],
      force: true
    }
    const options = { headers: headers, body: formData };
    return this.http.request<Observable<any>>('delete',baseUrl, options)
    .pipe(map((res: any) => {
      return res;
    }),
    catchError(err => this.handleError(err)))
  }

  getRateBrokers(rateUid): Observable<any> {
    var baseUrl = this.baseUrl + "api/rate-broker/get-list";
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateUid: {
        op: 'eq',
        value: rateUid
      }
    }
    return this.http.post<ListPageWrapper<RateBrokerItem>>(baseUrl, formData, options)
    .pipe(map((res: any) => {
      const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
      return response.items;
    }),
    catchError(err => this.handleError(err)))
  } 

  deleteBroker(uID: string): Observable<any> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    this.spinnerService.show('Deleting Broker');
    return this.http.delete(this.baseUrl + 'api/broker/' + uID, options).pipe(
      map((res) => {
        this.spinnerService.hide();
        return res;
      }),
      catchError((err) => {
        this.spinnerService.hide();
        return this.handleError(err);
      }),
    );
  }

  uploadInvoiceTemplate(uID: string, file: File): Observable<any> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    options.headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');

    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post(`${this.baseUrl}api/broker/${uID}/upload-invoice-template`, formData, options)
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  deleteInvoiceTemplate(uID: string): Observable<any> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };

    return this.http
      .delete(`${this.baseUrl}api/broker/${uID}/delete-invoice-template`, options)
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  downloadInvoiceTemplate(uID: string) {
    return this.http
      .get(`${this.baseUrl}api/broker/${uID}/invoice-template`, { responseType: 'blob' })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  downloadTestInvoice(uID: string) {
    return this.http
      .get(`${this.baseUrl}api/broker/${uID}/invoice-template-test`, { responseType: 'blob' })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  getShortBrokers() {
    const headers = this.prepareHeaders();
    const options = { headers: headers };

    return this.http.get<BrokerShortListItem[]>(this.baseUrl + "api/broker/short", options)
      .pipe(map(res => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  getUnbilledReservations(brokerUID: string) {
    const headers = this.prepareHeaders();
    const options = { headers: headers };

    return this.http.get<UnbilledReservationListItem[]>(this.baseUrl + `api/broker/${brokerUID}/unbilled-reservations`, options)
      .pipe(map(res => {
        return res;
      }),
        catchError(err => this.handleError(err)));
  }

  getBrokersCreationList(pageNum: number): Observable<ListPageWrapper<BrokerListItem>> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };

    return this.http
      .get<ListPageWrapper<BrokerListItem>>(`${this.baseUrl}api/broker/creation-list/page/${pageNum}`, options)
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => this.handleError(err)),
      );
  }
  createAllBrokerInvoice(): Observable<any> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    options.headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');

  

    return this.http
      .post(`${this.baseUrl}api/broker/creation-list`, options)
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => this.handleError(err)),
      );
  }

}
