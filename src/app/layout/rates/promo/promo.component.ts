import { Component, OnInit, EventEmitter, SimpleChange, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RatesPromoCreateModel, RatesPromoDetailModel, RatesPromoViewModel } from 'app/shared/models/rates/rates-promo-view.model';
import { PromoGridDecorator } from '../rates-general/grid-decorators/promo-grid-decorator';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { CountryService } from 'app/shared/services/financial/country.service';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { BrokerService } from 'app/shared/services/broker/broker.service';
import { BrokerItem } from 'app/shared/models/broker-list-item.model';
import { VehicleModel } from 'app/shared/models/rates/vehicle-category-model';
import { ReservationListItem } from 'app/shared/models/reservation/reservation-list-item.model';
import { PromoColumnDefs } from './promo.columnDefs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmationModalComponent } from '../rates-general/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { CountryViewModel } from 'app/shared/models/financial/country-view.model';
import { GlobalService } from 'app/shared/services/global.service';

@Component({
  selector: 'app-promo',
  templateUrl: './promo.component.html',
  styleUrls: ['./promo.component.css']
})
export class PromoComponent implements OnInit {

  public formGroup: FormGroup;

  public newPromoRowPrototype: RatesPromoViewModel;
  public newPromoEmitter = new EventEmitter<any>();
  public autoRowEditEmitter = new EventEmitter<any>();
  public stopRowEditiingEmitter = new EventEmitter<any>();
  public countries: CountryViewModel[]
  public brokers: BrokerItem[]
  public vehicleCategories: VehicleModel[]
  public promoDecorator: PromoGridDecorator = new PromoGridDecorator({}, this.ratesService)
  public columnDefs = new PromoColumnDefs().columnDefs;

  public rowData = [];
  public optionsObject: any = {}
  public dialogRef: any
  public isModalShow: boolean = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly ratesService: RatesService,
    private readonly countryService: CountryService,
    private readonly brokerService: BrokerService,
    private readonly dialog: MatDialog,
    private readonly globalService: GlobalService
  ) { }

  ngOnInit(): void {
    localStorage.setItem("promoEditing", JSON.stringify({ status: false }))
    this.formGroup = this.formBuilder.group({
      countryUid: [''],
      brokerUid: [''],
      vehicleCategoryUid: ['']
    });

    this.globalService.getRateInfoCreateSbj().subscribe((code) => {
      if(code === 'promo-create') {
        this.newPromoEmitter.emit('new');
      }
    })

    this.route.data
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (data: { promos: RatesPromoDetailModel[] }) => {
          forkJoin([
            this.countryService.getCountries("1", 999),
            this.brokerService.getBrokers(),
            this.ratesService.getVehicles(0, 999)
          ]).subscribe(([countriesResponse, brokersResponse, vehiclesResponse]) => {
            this.countries = countriesResponse.items;
            this.brokers = brokersResponse;
            this.vehicleCategories = vehiclesResponse.items;
            this.optionsObject['country'] = this.countries.map(country => country.code);
            this.optionsObject['broker'] = this.brokers.map(broker => broker.name);
            this.optionsObject['vehicleCategory'] = this.vehicleCategories.map(vehicleCategory => vehicleCategory.code);
            this.columnDefs[0]['children'][0]['cellEditorParams'] = { options: this.optionsObject['country'] };
            this.columnDefs[0]['children'][1]['cellEditorParams'] = { options: this.optionsObject['broker'] };
            this.columnDefs[0]['children'][2]['cellEditorParams'] = { options: this.optionsObject['vehicleCategory'] };
            this.columnDefs = [...this.columnDefs]
            if (data.promos.length > 0) {
              this.generateRowData(data.promos)
            } else {
              this.rowData = null;
            }
          })
        },
      );
    this.ratesService.getSelectRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        console.log(param);
        if (param.colDef.field === "promo")
          this.autoRowEditEmitter.emit({ rowIndex: param.rowIndex, data: param.data, type: "promo" });
      })

    this.ratesService.getCreateRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(param => {
        if (param.colDef.field === "promo") {
          this.stopRowEditiingEmitter.emit("data");
        }
      })

    this.ratesService.getCancelRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "promo") {
          let previousRowData = JSON.parse(localStorage.getItem("promoData"));
          let interRowData = this.rowData;
          let index = interRowData.findIndex(row => row.uid === param.data.uid);
          interRowData[index] = previousRowData.find(row => row.uid === param.data.uid);
          this.rowData = [...interRowData]
        }
      })

    this.ratesService.getRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "promo") {
          this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
            data: {
              description: "Please confirm that you want to remove this promo?"
            }
          });
          this.dialogRef.afterClosed().subscribe(result => {
            this.isModalShow = false;
            if (result.result === 1) {
              let formData = {
                data: [
                  {
                    uid: param.data.uid,
                    entityVersion: param.data.entityVersion
                  }
                ],
                force: true
              }
              this.ratesService.deletePromo(formData).subscribe(() => {
                this.rowData = this.rowData.filter((row, index) => index !== param.rowIndex)
              })
            }
          })
        }
      })

    this.ratesService.getCreateRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(param => {
        if (param.colDef.field === "promo") {
          this.stopRowEditiingEmitter.emit("data");
        }
      })

      this.ratesService.getGridChangedSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((changedGrid) => {
        if (changedGrid && changedGrid.type === 'promo') {
          if (!changedGrid.rowEditing) {
            let countryUid = this.countries.find(c => c.code === changedGrid.data.country).uid;
            let brokerUid  = this.brokers.find(c => c.name === changedGrid.data.broker).uid;
            let vehicleCategoryUid = this.vehicleCategories.find(c => c.code === changedGrid.data.vehicleCategory).uid;
            let formData = {
              data: [new RatesPromoCreateModel({...changedGrid.data, countryUid, brokerUid, vehicleCategoryUid})]
            };
            if (changedGrid.data.uid) {
              formData.data[0]['uid'] = changedGrid.data.uid;
              formData.data[0]['entityVersion'] = changedGrid.data.entityVersion;
              this.ratesService.updatePromo(formData).subscribe((promo: RatesPromoDetailModel) => {
                let country = this.countries.find(i => i.uid === promo.countryUid)?.code;
                let broker = this.brokers.find(i => i.uid === promo.brokerUid)?.name;
                let vehicleCategory = this.vehicleCategories.find(i => i.uid === promo.vehicleCategoryUid)?.code;
                let index = this.rowData.findIndex(row => row.uid === promo.uid);
                this.rowData[index] = { ...new RatesPromoViewModel({ ...promo, country: country, broker: broker, vehicleCategory: vehicleCategory }), uid: promo.uid, entityVersion: promo.entityVersion };
                this.rowData = [...this.rowData]
              })
            } else {
              this.ratesService.createPromo(formData).subscribe((promo: RatesPromoDetailModel) => {
                let country = this.countries.find(i => i.uid === promo.countryUid)?.code;
                let broker = this.brokers.find(i => i.uid === promo.brokerUid)?.name;
                let vehicleCategory = this.vehicleCategories.find(i => i.uid === promo.vehicleCategoryUid)?.code;
                if(this.rowData)
                  this.rowData.push({ ...new RatesPromoViewModel({ ...promo, country: country, broker: broker, vehicleCategory: vehicleCategory }), uid: promo.uid, entityVersion: promo.entityVersion });
                else
                  this.rowData = [{ ...new RatesPromoViewModel({ ...promo, country: country, broker: broker, vehicleCategory: vehicleCategory }), uid: promo.uid, entityVersion: promo.entityVersion }]
                this.rowData = [...this.rowData]
              })
            }
          }
        }
      });

  }


  filter(): void {
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      }
    }
    Object.keys(this.formGroup.value).map(key => {
      if (!!this.formGroup.value[key])
        formData[key] = {
          op: "eq",
          value: this.formGroup.value[key]
        };
    })
    this.ratesService.getPromoList(formData).subscribe((promos: RatesPromoDetailModel[]) => {
      if (promos.length > 0) {
        this.generateRowData(promos);
      } else {
        this.rowData = null;
      }
    })
  }

  generateRowData(promos: RatesPromoDetailModel[]) {
    let rowData = []
    for (let item of promos) {
      let country = this.countries.find(i => i.uid === item.countryUid)?.code;
      let broker = this.brokers.find(i => i.uid === item.brokerUid)?.name;
      let vehicleCategory = this.vehicleCategories.find(i => i.uid === item.vehicleCategoryUid)?.code;
      rowData.push({ ...new RatesPromoViewModel({ ...item, country: country, broker: broker, vehicleCategory: vehicleCategory }),countryUid:item.countryUid, brokerUid:item.brokerUid, vehicleCategoryUid: item.vehicleCategoryUid, uid: item.uid, entityVersion: item.entityVersion });
    }
    this.rowData = [...rowData]
    localStorage.setItem('promoData', JSON.stringify(this.rowData));
  }

  insertNewPromo(): void {
    this.newPromoEmitter.emit('data');
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

}
