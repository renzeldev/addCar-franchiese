import { Component, EventEmitter, OnInit, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { DayBreakGridDecorator } from '../grid-decorators/day-break-grid-decorator';
import { ActivatedRoute } from '@angular/router';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { RateSeasonValueDetailsModel } from 'app/shared/models/rates/rates-season-view.model';

import { CheckboxCellEditorComponent } from "app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component";
import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { Subject, Subscription } from 'rxjs';
import { SippButtonGroupComponent } from 'app/shared/components/editable-grid/sipp-button-group/sipp-button-group.component';
import { takeUntil } from 'rxjs/operators';
import { DaybreakButtonGroupComponent } from 'app/shared/components/editable-grid/daybreak-button-group/daybreak-button-group.component';
import { NotificationService } from 'app/shared/services/notification.service';
import { MessageCodes } from 'app/shared/models/system/message-codes';
@Component({
  selector: 'app-rates-general-mileage-day-breaks',
  templateUrl: './rates-general-mileage-day-breaks.component.html',
  styleUrls: ['./rates-general-mileage-day-breaks.component.css']
})
export class RatesGeneralMileageDayBreaksComponent implements OnInit {

  list: any[] = [];
  @Input() addDayBreakEmitter: EventEmitter<any>;
  @Input() vehicleCategories: any
  @Input() cancelSeasonChangeEmitter: any

  stopRowEditiingEmitter = new EventEmitter<any>();
  rateSeasonValueDetails: RateSeasonValueDetailsModel[]
  newRowEmitter = new EventEmitter<any>();
  pinActionColumn = new EventEmitter<any>();
  vehicles: any[] = [];
  columnDefs: any[] = []
  newDayBreakRowPrototype: any = {};
  registeredVehicleCategories: any[] = [];
  seasonUid: string;
  rateUid: string

  autoRowEditEmitter: EventEmitter<any> = new EventEmitter

  rowData = [];

  dayBreakDecorator = new DayBreakGridDecorator(this.ratesService);
  changedDayBreakData: any[] = []

  isEditMode: boolean = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private ratesService: RatesService,
    private notifr: NotificationService
  ) { }

  ngOnInit(): void {
    this.subscribeToParentEmitter();
    this.route.params.subscribe((x) => {
      if (Object.keys(x).length === 0) {
        this.rowData = null;
      }
    });
    this.route.paramMap.subscribe(paramMap => {
      this.rateUid = paramMap['params']['uid'];
    })
    this.ratesService.getSelectRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "daybreak")
          this.autoRowEditEmitter.emit({ rowIndex: param.rowIndex, data: param.data, type: 'dayBreak' })
        if (param.colDef.field === 'season') {
          if(this.columnDefs[this.columnDefs.length-1]?.field !== "daybreak")
            this.columnDefs = this.columnDefs.concat({ headerName: "Action", field: "daybreak", cellRenderer: DaybreakButtonGroupComponent, pinned: "right", width: 120 })
        }
      })

    this.ratesService.getCancelRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "daybreak") {
          let previousRowData = JSON.parse(localStorage.getItem("mileageData")).data;
          if (!previousRowData) return;
          let interRowData = this.rowData;
          let index = interRowData.findIndex(row => row.mileage === param.data.mileage);
          interRowData[index] = previousRowData.filter(row => row.mileage === param.data.mileage)[0];
          this.rowData = [...interRowData];
          this.changedDayBreakData = this.changedDayBreakData.filter(r => r.rowIndex !== param.rowIndex);
        }
      })

    this.cancelSeasonChangeEmitter?.subscribe((param) => {
      if (param) {
        let previousRowData = JSON.parse(localStorage.getItem("mileageData")).data;
        if (param.colDef.field === "season") {
          this.columnDefs = this.columnDefs.splice(0, -1);
          if (!previousRowData)
            this.rowData = null
          else
            this.rowData = [...previousRowData];
        }
      }
    })

    this.ratesService.getRateSeasonValuesSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((uid: string) => {
        this.ratesService.getRegisteredVehicleCategories()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data) => {
            if (!data.type || data.type !== 'other')
              return;
            this.vehicleCategories = data.allVehicleCategories;
            this.registeredVehicleCategories = data.registeredVehicleCategories;
            if (uid === null) return;
            this.seasonUid = uid;
            this.rowData = null;
            this.buildDayBreaksGrid();
          })

      })

    this.ratesService.getNewSippCodeSignalSubjet()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data) {
          this.registeredVehicleCategories = data.registeredVehicleCategories
          this.buildDayBreaksGrid();
        }
      })

    this.ratesService.getGridChangedSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((changedGrid) => {
        if (changedGrid && changedGrid.type === 'daybreak') {
          this.changedDayBreakData.push({ rowIndex: changedGrid.rowIndex, data: changedGrid.data })
        }
        if (changedGrid && changedGrid.type === 'season') {
          if (!changedGrid.rowEditing) {
            let previousRowData = JSON.parse(localStorage.getItem('mileageData')).data;
            if (!previousRowData) {
              this.rowData = null;
              localStorage.setItem('mileageData', JSON.stringify({ data: null }));
            }
          }
        }
      })

    this.ratesService.getCreateRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        let updatedRateSeasonValues = [];
        if (param.colDef.field === "season" && param.isValidate) {
          this.columnDefs = this.columnDefs.slice(0, -1);
          if (param.data.uid) {
            for (let changedData of this.changedDayBreakData) {
              for (let vehicle of this.vehicles) {
                let seasonValue = this.rateSeasonValueDetails.find(v => v.uid === changedData.data[vehicle + "_Uid"]);
                seasonValue.freeMiles.distanceIncluded = changedData.data[vehicle + "_No"];
                seasonValue.freeMiles.price = changedData.data[vehicle + "_Value"];
                seasonValue.freeMiles.isUnlimited = changedData.data[vehicle + "_IsUnlimited"];
                seasonValue.freeMiles.isResetDaily = changedData.data[vehicle + "_Free"];
                updatedRateSeasonValues.push(seasonValue);
              }
            }
            if (updatedRateSeasonValues.length === 0) return;
            if (!this.validateUpdates(updatedRateSeasonValues)) {
              this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
              return;
            } else {
              this.ratesService.updateRateSeasonValues(updatedRateSeasonValues).subscribe((updatedSeasons: RateSeasonValueDetailsModel[]) => {
                let formData = {
                  pageInfo: {
                    index: 0,
                    size: 999
                  },
                  rateSeasonUid: {
                    op: "eq",
                    value: this.seasonUid
                  }
                }
                this.ratesService.getRateSeasonValues(formData).subscribe((seasons: RateSeasonValueDetailsModel[]) => {
                  this.rateSeasonValueDetails = seasons;
                  this.buildDayBreaksRowData();
                  this.buildGridStyle(this.vehicles);
                })

              });
            }
          }
        }
        if (param.colDef.field === "daybreak") {
          this.stopRowEditiingEmitter.emit("data");
        }
      })
  }

  subscribeToParentEmitter(): void {
    this.addDayBreakEmitter?.subscribe((data: string) => {
      this.newRowEmitter.emit(data);
    });
  }

  addNewColumn(vehicle): any {
    let newColumn = {
      groupId: vehicle,
      headerName: vehicle,
      children: [
        { field: `${vehicle}_No`, headerName: 'No of Free KMs', editable: true, cellEditor: NumberCellEditorComponent, width: 160 },
        { field: `${vehicle}_Free`, headerName: 'Free KMs per Day', editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value === true) return 'Yes'; else return 'No' }, width: 160 },
        { field: `${vehicle}_Value`, headerName: 'Value', editable: true, cellEditor: NumberCellEditorComponent, width: 80 },
        { field: `${vehicle}_IsUnlimited`, headerName: 'Is Unlimited', editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value === true) return 'Yes'; else return 'No' }, width: 160 }
      ]
    };
    return newColumn;
  }

  buildGridStyle(vehicles): void {
    this.newDayBreakRowPrototype = {};
    this.columnDefs = [];
    localStorage.setItem('mileageData', JSON.stringify({ data: null }));
    // this.vehicles = [];
    if (vehicles.length > 0) {
      this.newDayBreakRowPrototype = {};
      this.newDayBreakRowPrototype['mileage'] = null;
      let columnDefs = [];
      columnDefs.push(this.addInitialColumn);
      for (var i = 0; i < vehicles.length; i++) {
        columnDefs.push(this.addNewColumn(vehicles[i]));
        this.newDayBreakRowPrototype[`${vehicles[i]}_No`] = null;
        this.newDayBreakRowPrototype[`${vehicles[i]}_Free`] = false;
        this.newDayBreakRowPrototype[`${vehicles[i]}_Value`] = null;
        this.newDayBreakRowPrototype[`${vehicles[i]}_IsUnlimited`] = false;
      }
      // columnDefs.push({ headerName: "Action", field: "daybreak", cellRenderer: DaybreakButtonGroupComponent, pinned:"right", width: 120 })
      if (columnDefs && columnDefs.length > 0) {
        this.columnDefs = [...columnDefs];
      }
    }
  }

  buildDayBreaksGrid() {
    this.vehicles = [];
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateSeasonUid: {
        op: "eq",
        value: this.seasonUid
      }
    }
    this.ratesService.getRateSeasonValues(formData).subscribe((rateSeasonValues: RateSeasonValueDetailsModel[]) => {
      this.rateSeasonValueDetails = rateSeasonValues;
      if (this.rateSeasonValueDetails && this.rateSeasonValueDetails.length > 0) {
        this.buildDayBreaksRowData();
        this.buildGridStyle(this.vehicles);
      } else {
        this.buildGridStyle(this.vehicles);
      }
    })
  }

  buildDayBreaksRowData() {
    let mileages = [];
    let dataSet = [];
    for (var i = 0; i < this.rateSeasonValueDetails.length; i++) {
      let vehicleCategory = this.registeredVehicleCategories.filter(v => v.uid === this.rateSeasonValueDetails[i].vehicleCategoryUid)[0];
      if (vehicleCategory) {
        let vehicle = vehicleCategory.code;
        this.vehicles.indexOf(vehicle) < 0 && this.vehicles.push(vehicle);
        if (mileages.indexOf(this.rateSeasonValueDetails[i].rateDayBreakUid) < 0) {
          mileages.push(this.rateSeasonValueDetails[i].rateDayBreakUid);
          dataSet[this.rateSeasonValueDetails[i].rateDayBreakUid] = [this.rateSeasonValueDetails[i]]
        } else {
          dataSet[this.rateSeasonValueDetails[i].rateDayBreakUid].push(this.rateSeasonValueDetails[i])
        }
      }
    }
    if (dataSet && Object.keys(dataSet).length > 0) {
      let rowData = [];
      this.ratesService.getRateSeasonDayBreaks(this.rateUid).subscribe((response) => {
        let dayBreaks = response.items;
        for (var i = 0; i < Object.keys(dataSet).length; i++) {
          let data = Object.keys(dataSet)[i];
          let newData = {}
          let dayBreak = dayBreaks.filter(i => i.uid === data)[0];
          if (dayBreak) {
            newData['mileage'] = `${dayBreak.periodDaysFrom}-${dayBreak.periodDaysTo}`;
            dataSet[data].forEach(element => {
              let vehicle = this.registeredVehicleCategories.filter(v => v.uid === element.vehicleCategoryUid)[0].code;
              newData[`${vehicle}_Uid`] = element.uid;
              newData[`${vehicle}_No`] = element.freeMiles.distanceIncluded;
              newData[`${vehicle}_Free`] = element.freeMiles.isResetDaily;
              newData[`${vehicle}_Value`] = element.freeMiles.price;
              newData[`${vehicle}_IsUnlimited`] = element.freeMiles.isUnlimited;
              newData[`${vehicle}_SippValue`] = element.value;
            });
            rowData.push(newData);
          }

        }
        this.rowData = rowData;
        this.pinActionColumn.emit({ type: "dayBreakAction" })
        localStorage.setItem('mileageData', JSON.stringify({ data: rowData }));
      });
    }
  }

  validateUpdates(seasons) {
    for (let season of seasons) {
      if (season.freeMiles.distanceIncluded < 0 || season.freeMiles.price < 0 || season.freeMiles.isUnlimited < 0 || season.freeMiles.isResetDaily < 0) {
        return false;
      }
    }
    return true;
  }

  get addInitialColumn(): any {
    let initialColumn = {
      groupId: 'mileage',
      headerName: 'Mileage',
      children: [
        { field: 'mileage', headerName: 'Day Breaks', editable: true, width: 120 },
      ],
    };
    return initialColumn;
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

}
