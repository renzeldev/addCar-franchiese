import { Component, EventEmitter, OnInit, SimpleChanges, Input } from '@angular/core';
import { ExcessGridDecorator } from '../../rates-general/grid-decorators/excess-grid-decorator';
import { RatesExcessViewModel } from 'app/shared/models/rates/rates-excess-view.model';
import { ActivatedRoute } from '@angular/router';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { RateSeasonExcessValueDetailsModel } from 'app/shared/models/rates/rates-season-view.model';
import { NumberCellEditorComponent } from 'app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component';
import { Subject, Subscription } from 'rxjs';
import { NotificationService } from 'app/shared/services/notification.service';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { SippButtonGroupComponent } from 'app/shared/components/editable-grid/sipp-button-group/sipp-button-group.component';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { R } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-rates-general-excess',
  templateUrl: './rates-general-excess.component.html',
  styleUrls: ['./rates-general-excess.component.css'],
})
export class RatesGeneralExcessComponent {
  @Input() vehicleCategories: any
  @Input() discardRowDataChange: any
  @Input() isRowEditing: boolean
  @Input() cancelSeasonChangeEmitter: any
  excessDecorator = new ExcessGridDecorator(this.ratesService);
  newExcessEmitter = new EventEmitter<any>();
  stopRowEditiingEmitter = new EventEmitter<any>();
  autoRowEditEmitter = new EventEmitter<any>();

  seasonExcesses: any
  newExcessRowPrototype: any
  vehicles: any
  excessValues: any
  excesses: any[] = []
  availableExcesses: any[] = []
  seasonUid: string
  columnDefs = []

  newExcessUid: string

  rowData = [];
  newExcessData: any[] = []
  initialRowData: readonly any[] = [];

  cancelRateSeasonSubscription$: Subscription

  updatedExcessRowData: any[] = []

  dialogRef: any
  isModalShow: boolean = false

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private readonly route: ActivatedRoute,
    private ratesService: RatesService,
    private notifr: NotificationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.rowData = null;
    localStorage.setItem('excessData', JSON.stringify([]));
    this.route.params.subscribe((x) => {
      if (Object.keys(x).length === 0) {
        this.rowData = null;
      }
    });
    this.ratesService.getRemoveRateSeasonSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((uid) => {
        this.rowData = null;
      })
    this.ratesService.getRateSeasonExcessSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(uid => {
        this.seasonUid = uid;
        this.initializeGrid();
      })

    let pageInfo = {
      index: 0,
      size: 999
    }
    this.ratesService.getExcesses({ pageInfo }).subscribe(excesses => {
      this.excesses = excesses;
    })

    this.ratesService.getSelectRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "season") {
          if (this.columnDefs[this.columnDefs.length - 1]?.field !== "excess") {
            this.columnDefs = this.columnDefs.concat({ headerName: "Action", field: 'excess', cellRenderer: SippButtonGroupComponent, cellRendererParams: { clicked: (field: any) => { } }, width: 120 });
          }
        }
        if (param.colDef.field === "excess")
          this.autoRowEditEmitter.emit({ rowIndex: param.rowIndex, data: param.data, type: 'excess' })
      })

    this.ratesService.getGridChangedSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(changedGrid => {
        if (changedGrid && changedGrid.type === 'excess') {
          if (!changedGrid.rowEditing) {
            let index = this.updatedExcessRowData.findIndex(row => row.uid === changedGrid.data.uid);
            if (index < 0) {
              this.updatedExcessRowData.push(changedGrid.data);
            } else {
              this.updatedExcessRowData[index] = changedGrid.data
            }
          }
        }
      })

    this.ratesService.getCreateRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(param => {
        this.columnDefs = this.columnDefs?.slice(0, -1);
        if (param.colDef.field === "season" && param.isValidate) {
          if (this.updatedExcessRowData.length > 0) {
            let updateExcessList = [];
            for (let item of this.updatedExcessRowData) {
              Object.keys(item).forEach(key => {
                if (key.includes("_uid")) {
                  let vehicle = key.split('_')[0];
                  let seasonExcessValue = this.excessValues.find(v => v.uid === item[key])
                  if (this.checkUpdateExtraValue(item, seasonExcessValue, vehicle)) {
                    updateExcessList.push({ ...seasonExcessValue, value: item[vehicle] })
                  }
                }
              })
            }
            let formData = {
              data: updateExcessList
            }
            this.updatedExcessRowData = [];
            this.ratesService.updateRateSeasonExcessValue(formData).subscribe((resData: any) => {
              localStorage.setItem('excessData', JSON.stringify(this.rowData))
              for (let item of resData) {
                let index = this.excessValues.findIndex(r => r.uid === item.uid);
                this.excessValues[index] = item;
              }
              this.notifr.showSuccessMessage(MessageCodes.SeasonSaveSuccess);
            })
          }
        }
        if (param.colDef.field === "excess") {
          this.stopRowEditiingEmitter.emit("data");
        }
      })

    this.ratesService.getDeleteRateSeasonSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "excess") {
          this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
            data: {
              description: "Please confirm that you want to remove this excess?"
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
              this.ratesService.deleteRateSeasonExcess(formData).subscribe((res) => {
                this.rowData = this.rowData.filter(r => r.uid !== param.data.uid);
                if (this.rowData.length === 0) this.rowData = null;
                this.generateAvailablExcess();
              })
            }
          })
        }
      })

    this.ratesService.getCancelRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "excess") {
          let previousRowData = JSON.parse(localStorage.getItem("excessData"));
          if (!this.rowData) return;
          let interRowData = this.rowData;
          let index = interRowData.findIndex(row => row.ExcessCode === param.data.ExcessCode);
          interRowData[index] = previousRowData.find(row => row.ExcessCode === param.data.ExcessCode);
          this.rowData = [...interRowData]
          this.sortAlphabetically(this.rowData);
        }
      })

    this.cancelSeasonChangeEmitter?.subscribe((param) => {
      if (param) {
        this.columnDefs = this.columnDefs.splice(0, -1);
        // this.rowData = JSON.parse(localStorage.getItem('sippData')).data;
        if (param.colDef.field === "season") {
          this.rowData = JSON.parse(localStorage.getItem('excessData'));
        }
      }
    })

    this.ratesService.getNewSippCodeSignalSubjet()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data) {
          this.buildColumn(data.registeredVehicleCategories);
          this.buildGrids();
        }
      })
  }


  initializeGrid() {
    this.rowData = null;
    this.columnDefs = [];
    this.ratesService.getRegisteredVehicleCategories()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (!data.type || data.type !== 'other')
          return;
        this.vehicles = {};
        for (let vehicle of data.registeredVehicleCategories) {
          this.vehicles[vehicle.uid] = vehicle.code;
        }
        this.buildColumn(data.registeredVehicleCategories);
        this.buildGrids();
      })
  }

  buildColumn(registeredVehicleCategories) {
    this.vehicleCategories = registeredVehicleCategories;
    let newExcessRowPrototype = { ExcessCode: '' }
    let columnDefs = [];
    columnDefs.push({ field: 'ExcessCode', editable: false });
    for (var i = 0; i < registeredVehicleCategories.length; i++) {
      newExcessRowPrototype[registeredVehicleCategories[i].code] = 0;
      columnDefs.push({ field: registeredVehicleCategories[i].code, editable: true, width: 140, cellEditor: NumberCellEditorComponent });
    }
    this.columnDefs = [...columnDefs];
    this.newExcessRowPrototype = newExcessRowPrototype;
  }

  buildGrids() {
    this.ratesService.getRateSeasonExcessValues(this.seasonUid).subscribe((values: RateSeasonExcessValueDetailsModel[]) => {
      if (values.length > 0) {
        this.availableExcesses = [];
        this.excessValues = values;
        this.generateExcessData();
      } else {
        this.availableExcesses = [...this.excesses]
      }
    })
  }

  generateExcessData() {
    this.ratesService.getRateSeasonExcess(this.seasonUid).subscribe(excesses => {
      this.seasonExcesses = excesses;
      if (this.seasonExcesses && this.seasonExcesses.length > 0 && this.excessValues && this.excessValues.length > 0) {
        this.rowData = null;
        for (let i = 0; i < this.seasonExcesses.length; i++) {
          let excessRelatedItems = this.excessValues.filter(v => v.excessUid === this.seasonExcesses[i].excessUid);
          let newRowData = { ExcessCode: this.seasonExcesses[i].code, uid: this.seasonExcesses[i].uid, entityVersion: this.seasonExcesses[i].entityVersion };
          excessRelatedItems.map(i => {
            newRowData[this.vehicles[i.vehicleCategoryUid]] = i.value;
            newRowData[this.vehicles[i.vehicleCategoryUid] + "_uid"] = i.uid;
          })
          if (!this.rowData)
            this.rowData = [newRowData];
          else
            this.rowData = this.rowData.concat(newRowData);
        }
        this.rowData = this.sortAlphabetically(this.rowData);
        this.generateAvailablExcess()
        localStorage.setItem('excessData', JSON.stringify(this.rowData));
      }
    });
  }

  insertNewExcess() {
    let newExcessCode = this.excesses.filter(r => r.uid === this.newExcessUid)[0].code;
    if (!this.newExcessUid) {
      this.notifr.showErrorMessage(MessageCodes.AllAreNotFilledError);
    } else {
      let newExcessData = { ...this.newExcessRowPrototype };
      newExcessData.ExcessCode = newExcessCode;
      let formData = {
        data: [
          {
            seasonUid: this.seasonUid,
            excessUid: this.newExcessUid
          }
        ]
      }
      this.ratesService.createRateSeasonExcess(formData).subscribe((res) => {
        this.ratesService.getRateSeasonExcessValues(this.seasonUid).subscribe((values: RateSeasonExcessValueDetailsModel[]) => {
          let excessRelatedItems = values.filter(v => v.excessUid === res.data[0].excessUid);
          let newRowData = { ExcessCode: res.data[0].code, uid: res.data[0].uid, entityVersion: res.data[0].entityVersion };
          excessRelatedItems.map(i => {
            newRowData[this.vehicles[i.vehicleCategoryUid]] = i.value;
            newRowData[this.vehicles[i.vehicleCategoryUid] + "_uid"] = i.uid;
          })
          if (!this.rowData)
            this.rowData = [newRowData]
          else
            this.rowData = this.rowData.concat(newRowData);
          this.rowData = this.sortAlphabetically(this.rowData);
          localStorage.setItem('excessData', JSON.stringify(this.rowData));
          this.generateAvailablExcess()
        })
      })
    }
  }

  generateAvailablExcess() {
    this.availableExcesses = []
    if (!this.rowData) return;
    for (let item of this.excesses) {
      if (this.rowData.filter(r => r.ExcessCode === item.code).length === 0) {
        if (this.availableExcesses.filter(r => r.code === item.code).length === 0) {
          this.availableExcesses.push(item);
        }
      }
    }
  }

  checkUpdateExtraValue(rowData, excess, vehicle): boolean {
    if (rowData[`${vehicle}`] == excess['value']) {
      return false;
    } else {
      return true;
    }
  }

  sortAlphabetically(rowData): Array<any> {

    rowData.sort((a, b) => {
      const nameA = a.ExcessCode.toLowerCase();
      const nameB = b.ExcessCode.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    return rowData;
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
