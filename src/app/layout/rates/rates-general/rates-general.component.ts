import { Component, EventEmitter, OnInit, Input, Renderer2, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { SeasonsGridDecorator } from './grid-decorators/seasons-grid-decorator';
import { RateSeasonCreateModel, RateSeasonValueDetailsModel, RatesSeasonListModel } from 'app/shared/models/rates/rates-season-view.model';
import { ActivatedRoute, Router } from '@angular/router';
import { RatesService } from 'app/shared/services/rates/rates.service';
// import { RateCreateModel } from 'app/shared/models/rates/rates-item-detail.model';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { VehicleCategoryDetailModel, VehicleModel } from 'app/shared/models/rates/vehicle-category-model';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { CountryService } from 'app/shared/services/financial/country.service';
import { CurrencyService } from 'app/shared/services/financial/currency.service';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { NotificationService } from 'app/shared/services/notification.service';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { RateDetailsModel } from 'app/shared/models/rates/rates-item-detail.model';
import { takeUntil } from 'rxjs/operators';
import { LocationService } from 'app/shared/services/location/location.service';
import { LocationListItem } from 'app/shared/models/franchisee/location-list-item.model';

@Component({
  selector: 'app-rates-general',
  templateUrl: './rates-general.component.html',
  styleUrls: ['./rates-general.component.css']
})
export class RatesGeneralComponent implements OnInit {

  @Input() addSeasonEmitter: EventEmitter<any>;
  @ViewChild('matGroup') matGroup: MatTabGroup;

  public formGroup: FormGroup;

  newSeasonEmitter = new EventEmitter<any>();
  newDayBreakEmitter = new EventEmitter<any>();
  autoSelectRowEmitter = new EventEmitter<any>();
  autoEditRowEmitter = new EventEmitter<any>();
  discardRowDataChange = new EventEmitter<any>();
  stopRowEditiingEmitter = new EventEmitter<any>();

  cancelSeasonChangeEmitter = new EventEmitter<any>();

  rateSeasonValueDetails: RateSeasonValueDetailsModel[]

  newSeasonRowPrototype = new RateSeasonCreateModel();
  rateUid: string;
  rateData: any;
  vehicleCategories: VehicleModel[]
  registeredVehicleCategories: VehicleModel[] = []
  isSeasonInsert: boolean = false
  changedSeasons = []
  rowData: any[] = [];
  initialRowData: readonly RatesSeasonListModel[] = [];
  // updatedRowData: any[] = [];
  // newRowData: any[] = [];
  seasonsDecorator = new SeasonsGridDecorator(this.activeRoute, this.ratesService);
  indexOld: number = 0;
  selectedTab: string = '';
  isModalShow: boolean = false;
  dialogRef: any
  selectedIndex: string
  isRowDataChanged: boolean = false;

  countries: any[];
  currencies: any[];
  locations: LocationListItem[];

  seasonUid: string
  initialRateForm: any
  rateInfo: RateDetailsModel

  isRowEditing: boolean = false;

  getRowStyle: any;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  tabList = {
    'General Data': 0,
    'Extras': 1,
    'Excess': 2,
    'Brokers': 3,
  }
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly activeRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly ratesService: RatesService,
    private readonly renderer: Renderer2,
    private readonly dialog: MatDialog,
    private countryService: CountryService,
    private currencyService: CurrencyService,
    private locaionService: LocationService,
    private notifr: NotificationService,
    private _cdr: ChangeDetectorRef,
  ) {
    this.initialRateForm = {
      code: "",
      countryUid: "",
      currencyUid: "",
      isActive: false,
      description: ""
    }
  }

  ngOnInit() {
    // localStorage.removeItem("seasons")
    localStorage.setItem("seasonEditing", JSON.stringify({ status: false }))
    this.formGroup = this.formBuilder.group({
      code: [this.initialRateForm.code, [Validators.required]],
      countryUid: [this.initialRateForm.countryUid, [Validators.required]],
      currencyUid: [this.initialRateForm.currencyUid, []],
      isActive: [this.initialRateForm.isActive],
      description: [this.initialRateForm.description, []],
    });
    this.activeRoute.data
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: { rate: RateDetailsModel }) => {
        this.rateInfo = data.rate;
        if (this.rateInfo) {
          this.formGroup.patchValue(this.rateInfo);
        }
      });
    this.countryService.getCountries("1", 999).subscribe((response: ListPageWrapper<any>) => {
      this.countries = response.items
    })
    this.currencyService.getCurrencies("1", 999).subscribe((response: ListPageWrapper<any>) => {
      this.currencies = response.items
    })
    this.ratesService.getRemoveRateSeasonSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((uid) => {
        this.rowData = this.rowData.filter(season => season.uid !== uid);
        if (this.rowData.length === 0) this.rowData = null
      })
    this.ratesService.getRateSeasonValuesSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((uid: string) => {
        this.seasonUid = uid;
        this.getRegisteredVehicleCategories();
      })
    this.activeRoute.queryParams.subscribe((query: any) => {
      this.rateData = {
        rateMax: query.rateMax,
        rateMin: query.rateMin,
        periodMin: query.periodMin,
        discountMax: query.discountMax
      }
    })
    this.activeRoute.paramMap.subscribe(paramMap => {
      this.rateUid = paramMap['params']['uid'];
      if (this.rateUid)
        this.getRateSeasons();
      else
        this.rowData = null;
    })
    // this.changedRateSeasonSubscriptions$ = this.ratesService.getChangedRateSeasonSubject().subscribe((data) => {
    //   this.changedSeasons.push(data);
    // })
    this.ratesService.getGridChangedSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((changedGrid) => {
        if (changedGrid && changedGrid.type === 'season') {
          this.rowData[changedGrid.rowIndex]['updated'] = changedGrid.rowEditing;
          this.isRowEditing = changedGrid.rowEditing;
          if (!changedGrid.rowEditing) {
            if (changedGrid.data.uid) {
              let newData = { ...changedGrid.data }
              newData.bookingStartDate += "T00:00:00Z";
              newData.bookingEndDate += "T00:00:00Z";
              if (!this.isSeasonValueValid(newData)) {
                this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
                this.autoEditRowEmitter.emit({ rowIndex: changedGrid.rowIndex, data: changedGrid.data })
              } else if (!this.isSeasonDateValid(newData)) {
                this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
                this.setRedBorder(changedGrid);
              } else {
                this.ratesService.updateRateSeason([newData]).subscribe((res: any) => {
                  let interRowData = this.rowData;
                  interRowData[changedGrid.rowIndex] = res.data[0];
                  interRowData[changedGrid.rowIndex]['bookingStartDate'] = interRowData[changedGrid.rowIndex]['bookingStartDate'].split('T')[0];
                  interRowData[changedGrid.rowIndex]['bookingEndDate'] = interRowData[changedGrid.rowIndex]['bookingEndDate'].split('T')[0];
                  this.rowData = [...interRowData]
                  localStorage.setItem('seasons', JSON.stringify(this.rowData));
                  this.rowData.sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
                });
              }
            } else {
              let newData = { ...changedGrid.data, rateUid: this.rateUid }
              newData.bookingStartDate += "T00:00:00Z";
              newData.bookingEndDate += "T00:00:00Z";
              if (!this.isSeasonValueValid(newData)) {
                this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
                this.autoEditRowEmitter.emit({ rowIndex: changedGrid.rowIndex, data: changedGrid.data })
              } else if (!this.isSeasonDateValid(newData)) {
                this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
                this.setRedBorder(changedGrid);
              } else {
                this.ratesService.saveRateSeason([newData]).subscribe((res: any) => {
                  let interRowData = res.data[0];
                  interRowData['bookingStartDate'] = interRowData['bookingStartDate'].split('T')[0];
                  interRowData['bookingEndDate'] = interRowData['bookingEndDate'].split('T')[0];
                  this.rowData[this.rowData.length - 1] = interRowData;
                  localStorage.setItem('seasons', JSON.stringify(this.rowData));
                  this.rowData = [...this.rowData.sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())];
                  let index = this.rowData.findIndex(r => r.uid === res.data[0].uid);
                  this.autoSelectRowEmitter.emit({ rowIndex: index, data: res.data[0] });
                });
              }
            }
          }
        }
      })

    this.ratesService.getSelectRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "season") {
          this.autoEditRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data })
        }
      })
    this.ratesService.getCreateRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "season") {
          this.stopRowEditiingEmitter.emit("data");
        }
      })
    this.ratesService.getRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "season") {
          this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
            data: {
              description: "Please confirm that you want to delete this season?"
            }
          });
          this.dialogRef.afterClosed().subscribe(result => {
            this.isModalShow = false;
            if (result.result === 1) {
              this.ratesService.deleteRateSeason(param.data.uid, param.data.entityVersion).subscribe((result) => {
                if (result) {
                  this.rowData = this.rowData.filter((row, index) => index !== param.rowIndex)
                  this.autoSelectRowEmitter.emit({ rowIndex: 0, data: this.rowData[0] });
                }
              })
            } else {
              this.autoEditRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data })
            }
          })
        }
      })

    this.ratesService.getCancelRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "season") {
          this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
            data: {
              description: "Please confirm that you want to cancel all changes?"
            }
          });
          this.dialogRef.afterClosed().subscribe(result => {
            this.isModalShow = false;
            if (result.result === 1) {
              this.stopRowEditiingEmitter.emit("stop");
              let previousRowData = JSON.parse(localStorage.getItem("seasons"));
              let r = this.rowData;
              r[param.rowIndex] = previousRowData[param.rowIndex];
              this.rowData = [...r];
              this.cancelSeasonChangeEmitter.emit(param);
              // this.autoSelectRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data });
            } else {
              this.autoEditRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data })
            }
          })
        }
      })

  }

  getRateSeasons() {
    this.rowData = [];
    if (this.rateUid) {
      this.ratesService.getRateSeasons(this.rateUid).subscribe((seasonData: RatesSeasonListModel[]) => {
        this.rowData = seasonData;
        this.rowData.sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        localStorage.setItem("seasons", JSON.stringify(this.rowData));
        if (this.rowData.length > 0) {
          this.autoSelectRowEmitter.emit({ rowIndex: 0, data: seasonData[0] });
        } else {
          this.rowData = null;
        }
      })
      this.ratesService.getVehicles(0, 999).subscribe((vehicleCategories: ListPageWrapper<VehicleModel>) => {
        this.vehicleCategories = vehicleCategories.items;
      })
    } else {
      this.rowData = null;
    }
  }

  getRegisteredVehicleCategories() {
    forkJoin([
      this.ratesService.getAllVehicleCategory(this.seasonUid),
      this.ratesService.getVehicles(0, 999)
    ]).subscribe(([categories, vehicles]: [VehicleCategoryDetailModel[], ListPageWrapper<VehicleModel>]) => {
      let registeredVehicleUids = categories.filter(c => c.rateSeasonUid === this.seasonUid);
      let registeredVehicleCategories = [];
      for (let registeredVehicleUid of registeredVehicleUids) {
        let item = this.vehicleCategories.find(c => c.uid === registeredVehicleUid.vehicleCategoryUid);
        if(item)
          registeredVehicleCategories.push(item);
      }
      this.ratesService.sendRegisteredVehicleCategories({ registeredVehicleCategories: registeredVehicleCategories, type: 'other' });
      this.ratesService.sendRegisteredVehicleCategories({ registeredVehicleCategories: vehicles.items, allVehicleCategories: vehicles.items, categoryUids: categories, type: 'sipp' });
    })


  }

  tabChanged(event: MatTabChangeEvent): void {
    this.isRowDataChanged = this.rowData && this.rowData.filter((row) => row['updated']).length > 0 ? true : false
    if (this.isRowDataChanged) {
      if (this.isModalShow) {
        this.dialogRef.afterClosed().subscribe(result => {
          this.isModalShow = false;
          if (result.result === 1) {
            this.isRowDataChanged = false;
            this.isRowEditing = false;
            this.indexOld = this.tabList[this.selectedTab];
            this.matGroup.selectedIndex = this.tabList[this.selectedTab];
            this.discardSeason()
            this.ratesService.sendChangeRatesTabSubject();
            this.cancelSeasonChangeEmitter.emit({colDef:{field:"season"}});
          }
        })
      } else {
        this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
          data: {
            description: "Please confirm that you want to leave."
          }
        });
        this.isModalShow = true;
        this.matGroup.selectedIndex = this.indexOld;
      }
    } else {
      this.indexOld = event.index;
      this.ratesService.sendChangeRatesTabSubject();
    }

  }

  tabClick(event) {
    this.selectedTab = event.target.innerText;
  }

  insertSeason() {
    if (this.rowData === null) {
      this.rowData = [];
      this.newSeasonEmitter.emit('new');
    } else {
      for (let item of this.rowData) {
        if (!this.isSeasonNotEmpty(item))
          return;
      }
      this.newSeasonEmitter.emit('new');
    }
  }

  createRate() {
    if (this.formGroup.status === "VALID") {
      if (this.rateInfo?.uid) {
        this.ratesService.updateRates({ ...this.rateInfo, ...this.formGroup.value }).subscribe((res: any) => {
          this.rateInfo = res.data[0];
          this.notifr.showSuccess(`${this.formGroup.value.code} updated successfully.`);
        });
      } else {
        this.ratesService.saveRates(this.formGroup.value).subscribe((res: any) => {
          this.notifr.showSuccess(`${this.formGroup.value.code} created successfully.`);
          this.router.navigateByUrl(`/rates/${res.data[0].uid}`);
          // this.formGroup.patchValue(this.initialRateForm);
        })
      }
    } else {
      this.notifr.showErrorMessage(MessageCodes.AllAreNotFilledError);
    }
  }

  cancelCreate() {
    this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        description: "Changes might be not saved -- you sure to leave? Stay on page, Leave pop-up window must be displayed"
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.isModalShow = false;
      if (result.result === 1) {
        this.formGroup.patchValue(this.initialRateForm);
        this.router.navigate(['/rates/page']);
      }
    })
  }

  discardSeason() {
    // this.rowData = [...this.initialRowData];
    this.rowData = JSON.parse(localStorage.getItem("seasons"));
    if (this.rowData.length === 0) this.rowData = null;
  }

  insertDayBreak() {
    this.newDayBreakEmitter.emit('new');
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  isSeasonNotEmpty(newData) {
    return newData['startDate'] !== "" && newData['endDate'] !== "" && newData['description'] !== "" && newData['bookingStartDate'].split('T')[0] !== "" && newData['bookingEndDate'].split('T')[0] !== ""
      && newData['discountMax'] !== "" && newData['periodMin'] !== "" && newData['rateMax'] !== "" && newData['rateMin'] !== "";
  }

  isSeasonValueValid(season): boolean {
    if (season.rateMax < 0 || season.rateMin < 0 || season.discountMax < 0 || season.periodMin < 0)
      return false;
    if (season.periodMin % 1 !== 0)
      return false;
    return true;
  }

  isSeasonDateValid(season): boolean {
    if(!season.startDate || !season.endDate || !season.bookingStartDate || !season.bookingEndDate) {
      return false;
    }
    if (new Date(season.startDate).getTime() > new Date(season.endDate).getTime())
      return false;
    if (new Date(season.bookingStartDate).getTime() > new Date(season.bookingEndDate).getTime())
      return false;
    if (new Date(season.bookingStartDate).getTime() > new Date(season.endDate).getTime())
      return false;
    return true;
  }

  areAllValuesNotNullOrEmpty(obj) {
    return Object.values(obj).every(value => value !== null && value !== undefined && value !== '');
  }

  setRedBorder(param) {
    let newRowIndex = param.rowIndex;
    let querySelector = '[row-id="' + newRowIndex + '"] > *';
    let children = document.querySelectorAll(querySelector);
    for (let key of Object.keys(children)) {
      if (children[key]['attributes']['col-id']['nodeValue'] === 'startDate'
        || children[key]['attributes']['col-id']['nodeValue'] === 'endDate'
        || children[key]['attributes']['col-id']['nodeValue'] === 'bookingStartDate'
        || children[key]['attributes']['col-id']['nodeValue'] === 'bookingEndDate') {
        this.renderer.addClass(children[key], 'red-border');
      }
    }
  }
}
