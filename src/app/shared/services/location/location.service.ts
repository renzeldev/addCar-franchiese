// Service for processing server-side calls, related to 

// Initially powered by Stantum Angular Utils.
// Want to dramatically increase your development speed too? Visit https://www.stantum.cz/development-automation

import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from "rxjs";
import { map } from "rxjs/internal/operators/map";
import { catchError } from "rxjs/internal/operators/catchError";

import { SpinnerOverlayService } from "../spinner-overlay.service";
import { BaseService } from '../../common/base.service';
import { ListPageWrapper } from '../../common/list-page-wrapper.model';
import { IncludedLocation, LocationListItem, LocationType } from "../../models/franchisee/location-list-item.model";
import { LocationViewModel } from "../../models/location/location-view-model.model";
// import { LocationVehiclesViewModel } from "../../models/location/location-vehicles-view-model.model";


@Injectable()
export class LocationService extends BaseService {

  baseUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, private spinnerService: SpinnerOverlayService) {
    super();
    this.baseUrl = baseUrl;
  }

  getLocations(pageNum: number, size? :number, searchText?: string, searchCountry?: string, countryUid?: string): Observable<any> {
    var baseUrl = this.baseUrl + `api/location/get-list`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let query = "?";
    if (searchText)
      query = query + "searchText=" + encodeURI(searchText);
    if (searchCountry)
      query = query + "&countryUID=" + encodeURI(searchCountry);
    
    let formData = {
      pageInfo: {
        index: pageNum-1,
        size: size ?? 20
      }
    }
    if(countryUid) {
      formData['countryUid'] = {
        op: "eq",
        value: countryUid
      }
    }
    return this.http.post<ListPageWrapper<LocationListItem>>(baseUrl, formData, options)
    .pipe(
        map((res:any)=> {
          const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getLocation(uID: string): Observable<LocationViewModel> {
    var baseUrl = this.baseUrl + `api/location/get-details`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<LocationViewModel>(baseUrl, {uID}, options)
    .pipe(
      map((response: LocationViewModel) => {
        return response;
      })
    )
  }

  addLocation(locationData): Observable<LocationViewModel> {
    var baseUrl = this.baseUrl + `api/location`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<LocationViewModel>(baseUrl, { data: [ locationData ]}, options)
    .pipe(
      map((response: LocationViewModel) => {
        return response
      })
    )
  }

  updateLocation(locationData): Observable<LocationViewModel> {
    var baseUrl = this.baseUrl + `api/location`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put<LocationViewModel>(baseUrl, { data: [ locationData ]}, options)
    .pipe(
      map((response: LocationViewModel) => {
        return response
      })
    )
  }

  getLocationType(): Observable<LocationType[]> {
    var baseUrl = this.baseUrl + `api/location-type/list`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.get<{data: LocationType[]}>(baseUrl, options)
    .pipe(
      map((response: any) => {
        return response.data;
      })
    )
  }

  getRateLocations(rateUid): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-location/get-list`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateUid: {
        op: "eq",
        value: rateUid
      }
    }
    return this.http.post<ListPageWrapper<IncludedLocation>>(baseUrl, formData, options)
    .pipe(
      map((res: any) => {
        const response = new ListPageWrapper(res.totalCount, res.page.index, res.page.size, res.data);
        return response.items;
      })
    )
  }

  addRateLocation(rateUid, locationUid): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-location`;
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    let formData = {
      data: [
        {
          rateUid, locationUid
        }
      ]
    }
    return this.http.post<Observable<any>>(baseUrl, formData, options)
    .pipe(
      map((res: any) => {
        return res.data;
      })
    )
  }

  removeRateLocation(uid, entityVersion): Observable<any> {
    var baseUrl = this.baseUrl + `api/rate-location`;
    const headers = this.prepareHeaders();
    let formData = {
      data: [
        {
          uid, entityVersion
        }
      ],
      force: true
    }
    const options = { headers: headers, body: formData };
    return this.http.request<Observable<any>>('delete', baseUrl, options)
    .pipe(
      map((res: any) => {
        return res;
      })
    )
  }

  loadReturnLocations(uid: string): Observable<Array<LocationListItem>> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };

    return this.http
      .get<Array<LocationListItem>>(`${this.baseUrl}api/location/${uid}/return-locations`, options)
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => this.handleError(err)),
      );
  }


  // getLocationVehicles(uid: string): Observable<LocationVehiclesViewModel> {
  //   const headers = this.prepareHeaders();
  //   const options = { headers: headers };
  //   return this.http.get<LocationVehiclesViewModel>(`${this.baseUrl}api/location/${uid}/vehicles`, options).pipe(
  //     map((res) => {
  //       return res;
  //     }),
  //     catchError((err) => this.handleError(err)),
  //   );
  // }

  setLocationCategoryVehicle(locationUid: string, categoryUid: string, vehicleUid: string): Observable<any> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.put(`${this.baseUrl}api/location/${locationUid}/vehicles?categoryUid=${categoryUid}&vehicleUid=${vehicleUid}`, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  unsetLocationCategoryVehicle(locationUid: string, categoryUid: string, vehicleUid: string): Observable<any> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.delete(`${this.baseUrl}api/location/${locationUid}/vehicles?categoryUid=${categoryUid}&vehicleUid=${vehicleUid}`, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }


  saveLocation(item: LocationViewModel): Observable<LocationViewModel> {
    const headers = this.prepareHeaders();
    const options = { headers: headers };
    return this.http.post<LocationViewModel>(`${this.baseUrl}api/location/`, item, options).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => this.handleError(err)),
    );
  }

}
