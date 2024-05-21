import { Component, EventEmitter, OnInit, SimpleChanges, Input, ChangeDetectorRef } from '@angular/core';
import { SippCodeGridDecorator } from '../grid-decorators/sipp-code-grid-decorator';
import { ActivatedRoute } from '@angular/router';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { RateSeasonValueDetailsModel, RateSeasonValueUpdateModel } from 'app/shared/models/rates/rates-season-view.model';
import { DropdownCellEditorComponent } from 'app/shared/components/editable-grid/dropdown-cell-editor/dropdown-cell-editor.component';
import { NumberCellEditorComponent } from 'app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { NotificationService } from 'app/shared/services/notification.service';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { VehicleCategoryDetailModel, VehicleModel } from 'app/shared/models/rates/vehicle-category-model';
import { SeasonButtonGroupComponent } from 'app/shared/components/editable-grid/season-button-group/season-button-group.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { CheckboxCellEditorComponent } from 'app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component';
import { SippButtonGroupComponent } from 'app/shared/components/editable-grid/sipp-button-group/sipp-button-group.component';
import { CustomHeaderComponent } from 'app/shared/components/editable-grid/custom-header/custom-header.component';
import { DayBreakAddButtonComponent } from 'app/shared/components/editable-grid/custom-header/daybreak-add-button.component';
import { DayBreakAddComponent } from 'app/shared/components/editable-grid/custom-header/daybreak-add.component';
import { takeUntil } from 'rxjs/operators';
import { CheckboxCellRendererComponent } from 'app/shared/components/editable-grid/checkbox-cell-renderer/checkbox-cell-renderer.component';
@Component({
  selector: 'app-rates-general-sipp-code-list',
  templateUrl: './rates-general-sipp-code-list.component.html',
  styleUrls: ['./rates-general-sipp-code-list.component.css']
})
export class RatesGeneralSippCodeListComponent implements OnInit {
  @Input() vehicleCategories: any
  @Input() cancelSeasonChangeEmitter: any
  @Input() isRowEditing: boolean
  list: any[] = [];

  // newSippCodeRowPrototype = {sipp: '', '1': null, '2-3': null, '4-7': null, '8-14': null, '15-21': null, '21-31': null, '32-99': null};

  newSippCodeRowPrototype: any
  rowData = [];
  selectedRowData = [];
  initialRowData: readonly any[] = [];

  newSippEmitter = new EventEmitter<any>();
  autoRowEditEmitter = new EventEmitter<any>();
  selectAllRowEmitter = new EventEmitter<any>();
  stopRowEditiingEmitter = new EventEmitter<any>();
  columnDefs = [];
  dayBreaks = [];

  seasonUid: string

  options = []
  updateRateSeasons = {}
  sippCodeDecorator = new SippCodeGridDecorator(this.options, this.ratesService);
  // vehicleCategories: any;
  rateSeasonValueDetails: RateSeasonValueDetailsModel[] = [];
  updatedRateSeasonValueLists: RateSeasonValueUpdateModel[] = []
  vehicles: any[]
  dataSet: any = {}

  newSippCodeUid: string;
  rateUid: string;

  isModalShow: boolean = false;
  dialogRef: any

  percent: number;
  amount: number;
  getRowClass: any;

  registeredVehicleCategories: any[] = [];
  availableVehicleCategories: any[] = [];
  categoryUids: VehicleCategoryDetailModel[] = [];

  hasToUpdateDaybreaks: any[] = [];
  hasToAddDaybreaks: any[] = [];
  multiUpdateCells: any[] = [];

  isEditMode: boolean = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private readonly route: ActivatedRoute,
    private ratesService: RatesService,
    private notifr: NotificationService,
    private readonly dialog: MatDialog,
    private readonly _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    localStorage.setItem('daybreaksData', JSON.stringify([]));
    this.sippCodeDecorator = new SippCodeGridDecorator(this.options, this.ratesService);
    localStorage.setItem('sippData', JSON.stringify({ data: [] }));
    this.route.params.subscribe((x) => {
      if (Object.keys(x).length === 0) {
        this.rowData = null;
      }
    });
    // this.ratesService.getRemoveRateSeasonSubject().subscribe((uid) => {
    //   this.rowData = null;
    // })
    this.route.paramMap.subscribe(paramMap => {
      this.rateUid = paramMap['params']['uid'];
    })
    this.ratesService.getSelectRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "sipp") {
          this.autoRowEditEmitter.emit({ rowIndex: param.rowIndex, data: param.data, type: "sipp" });
        }
        if (param.colDef.field === "season") {
          if(this.columnDefs[this.columnDefs.length - 1].field !== "daybreakAdd")
            this.columnDefs = this.columnDefs.concat(
              { headerName: "Action", field: "sipp", cellRenderer: SippButtonGroupComponent, width: 120 },
              { headerName: "", field: "daybreakAdd", headerComponentFramework: DayBreakAddButtonComponent, headerComponentParams: { addEventHandler: this.handleNewDayBreakEvent.bind(this), checkEventHandler: this.handleUpdateDayBreakEvent.bind(this), closeEventHandler: this.handleRevertDayBreakChangeEvent.bind(this), editEventHandler: this.handleEditModeEvent.bind(this), isEdit: false }, width: 120 });
        }
      })

    this.ratesService.getGridChangedSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((changedGrid) => {
        if (changedGrid && changedGrid.type === 'sipp') {
          let uids = [];
          for (let key of Object.keys(changedGrid.data)) {
            if (key.includes("uid")) {
              uids.push({ uid: changedGrid.data[key], dayBreak: key.replace("_uid", "") });
            }
          }
          delete this.updateRateSeasons[changedGrid.rowIndex];
          for (let uid of uids) {
            let season = this.rateSeasonValueDetails.filter(r => r.uid === uid.uid)[0]
            if (this.updateRateSeasons[changedGrid.rowIndex] && this.updateRateSeasons[changedGrid.rowIndex].length > 0)
              this.updateRateSeasons[changedGrid.rowIndex].push({ ...season, value: changedGrid.data[uid.dayBreak], index: changedGrid.rowIndex })
            else
              this.updateRateSeasons[changedGrid.rowIndex] = [{ ...season, value: changedGrid.data[uid.dayBreak], index: changedGrid.rowIndex }]
          }
          this.rowData[changedGrid.rowIndex]['updated'] = true;

        }
      })

    this.ratesService.getCreateRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "season" && param.isValidate) {
          this.buildColumn();
          if (param.data.uid) {
            let updatedSeasonValue = [];
            if (!this.rowData) return;
            let updatedRowData = this.rowData.filter(r => r.updated);
            for (let item of updatedRowData) {
              let uids = [];
              for (let key of Object.keys(item)) {
                if (key.includes("_uid")) {
                  uids.push({ uid: item[key], dayBreak: key.replace("_uid", "") });
                }
              }
              for (let uid of uids) {
                let season = this.rateSeasonValueDetails.filter(r => r.uid === uid.uid)[0];
                updatedSeasonValue.push({ ...season, value: item[uid.dayBreak] });
              }
            }
            for (let item of this.multiUpdateCells) {
              let season = this.rateSeasonValueDetails.filter(r => r.uid === item.dayBreak_uid)[0];
              updatedSeasonValue.push({ ...season, value: item.value })
            }
            if(updatedSeasonValue.length === 0) {
              return;
            }
            if (this.validateSipp(updatedSeasonValue)) {
              this.ratesService.updateRateSeasonValues(updatedSeasonValue).subscribe((updatedSeasons: RateSeasonValueDetailsModel[]) => {
                this.multiUpdateCells = [];
                let interSeasonsValues = this.rateSeasonValueDetails;
                for(let item of updatedSeasons) {
                  let index = interSeasonsValues.findIndex(r => r.uid === item.uid);
                  interSeasonsValues[index] = item;
                }
                this.rateSeasonValueDetails = [...interSeasonsValues];
                this.buildSippCodeRowData();
                this.notifr.showSuccessMessage(MessageCodes.SeasonSaveSuccess);
              });
            } else {
              this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
            }
          } else {
            this.rowData = null;
            localStorage.setItem('sippData', JSON.stringify({ data: [] }));
          }
        }
        if (param.colDef.field === "sipp") {
          this.stopRowEditiingEmitter.emit("data");
        }
      })

    this.ratesService.getDeleteRateSeasonSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "sipp") {
          this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
            data: {
              description: "Are you sure to delete a group?"
            }
          });
          this.dialogRef.afterClosed().subscribe(result => {
            this.isModalShow = false;
            if (result.result === 1) {
              let formData = [{
                uid: param.data.uid,
                entityVersion: param.data.entityVersion
              }]
              this.ratesService.deleteVehicleCategory(formData).subscribe((res) => {
                if (result) {
                  this.rowData = this.rowData.filter((row, index) => index !== param.rowIndex);
                  this.generateAvailalbeVehicle();
                  localStorage.setItem("sippData", JSON.stringify({ data: this.rowData }))
                  if (this.rowData.length === 0) this.rowData = null;
                  this.categoryUids = this.categoryUids.filter(v => v.vehicleCategoryUid !== param.data.vehicleCategoryUid);
                  let registeredVehicleCategories = [];
                  for (let registeredVehicleUid of this.categoryUids) {
                    let item = this.vehicleCategories.find(c => c.uid === registeredVehicleUid.vehicleCategoryUid);
                    registeredVehicleCategories.push(item);
                  }
                  this.ratesService.sendNewSippCodeSignalSubject({ registeredVehicleCategories: registeredVehicleCategories });
                }
              })
            }
          })
        }
      })

    this.ratesService.getSelectedSippGridSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.data) {
          this.selectedRowData = param.data;
        }
      })

    this.cancelSeasonChangeEmitter?.subscribe((param) => {
      if (param) {
        // this.rowData = JSON.parse(localStorage.getItem('sippData')).data;
        let previousRowData = JSON.parse(localStorage.getItem("sippData")).data;
        if(param.colDef.field === "season") {
          this.columnDefs = this.columnDefs.slice(0, -2);
          if(previousRowData.length === 0)
            this.rowData = null;
          else
            this.rowData = [...previousRowData];
        }
        this.sortAlphabetically(this.rowData);
      }
    })

    this.ratesService.getCancelRowDataSubject()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((param) => {
      let previousRowData = JSON.parse(localStorage.getItem("sippData")).data;
      if (param.colDef.field === "sipp") {
        let interRowData = this.rowData;
        let index = interRowData.findIndex(row => row.sipp === param.data.sipp);
        interRowData[index] = previousRowData.filter(row => row.sipp === param.data.sipp)[0];
        this.rowData = [...interRowData]
      }
      this.sortAlphabetically(this.rowData);
    })

    this.ratesService.getRateSeasonValuesSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((uid: string) => {
        this.ratesService.getRegisteredVehicleCategories()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data) => {
            if (data.type && data.type === 'sipp') {
              this.vehicleCategories = data.allVehicleCategories;
              this.registeredVehicleCategories = data.registeredVehicleCategories;
              this.categoryUids = data.categoryUids;
              if (uid === null) return;
              this.seasonUid = uid;
              this.rowData = null;
              this.ratesService.getRateSeasonDayBreaks(this.rateUid).subscribe((response) => {
                if (response) {
                  this.dayBreaks = response.items;
                  localStorage.setItem('daybreaksData', JSON.stringify(this.dayBreaks));
                  this.buildColumn()
                  this.buildSippGrid();
                }
              });
            }
          })

      })
    this.ratesService.getUpdatedSippCodeUid()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((updatedSipp: { uid: string, value: string }) => {
      let previousSeasonValue = this.rateSeasonValueDetails.find(r => r.uid === updatedSipp.uid);
      let updatedSeasonValue: RateSeasonValueUpdateModel = new RateSeasonValueUpdateModel({ ...previousSeasonValue, value: updatedSipp.value });
      this.updatedRateSeasonValueLists.push(updatedSeasonValue);
    })
  }

  initializeGrid() {
    this.columnDefs = [];
    this.newSippCodeRowPrototype = {};
  }

  buildColumn() {
    let columnDefs = [];
    columnDefs.push({ field: 'sipp', editable: false, width: 120 });
    let protoType = { sipp: "" };
    for (var i = 0; i < this.dayBreaks.length; i++) {
      protoType[`${this.dayBreaks[i].periodDaysFrom}-${this.dayBreaks[i].periodDaysTo}`] = null;
      columnDefs.push({
        field: `${this.dayBreaks[i].periodDaysFrom}-${this.dayBreaks[i].periodDaysTo}`, editable: true, cellEditor: NumberCellEditorComponent,
        uid: this.dayBreaks[i].uid, width: 120, id: 'field', headerComponentParams: { uid: this.dayBreaks[i].uid, editEventHandler: this.handleEditDayBreakEvent.bind(this), deleteEventHandler: this.handleDeleteDayBreakEvent.bind(this) }
      });
    }
    this.columnDefs = [...columnDefs];
    this.newSippCodeRowPrototype = protoType;
  }

  buildSippGrid() {
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
      this.buildSippCodeRowData();
    })
  }

  buildSippCodeRowData() {
    this.dataSet = {}
    for (var i = 0; i < this.rateSeasonValueDetails.length; i++) {
      let vehicleCategory = this.registeredVehicleCategories.filter(v => v.uid === this.rateSeasonValueDetails[i].vehicleCategoryUid)[0];
      if (vehicleCategory) {
        let vehicle = vehicleCategory.code;
        if (Object.keys(this.dataSet).indexOf(vehicle) < 0) {
          this.dataSet[vehicle] = [this.rateSeasonValueDetails[i]]
        } else {
          this.dataSet[vehicle].push(this.rateSeasonValueDetails[i]);
        }
      }
    }
    this.rowData = null;
    for (var i = 0; i < Object.keys(this.dataSet).length; i++) {
      let sipp = Object.keys(this.dataSet)[i];
      let vehicle = this.vehicleCategories.find(v => v.code === sipp);
      let vehicleCategory = this.categoryUids.find(v => v.vehicleCategoryUid === vehicle.uid);
      if (vehicleCategory) {
        let newRowdata = { sipp: sipp, uid: vehicleCategory.uid, entityVersion: vehicleCategory.entityVersion, vehicleCategoryUid: vehicleCategory.vehicleCategoryUid };
        for (var j = 0; j < this.dataSet[sipp].length; j++) {
          let seasonValue = this.dataSet[sipp][j]
          let daybreak = this.dayBreaks.filter(i => i.uid === seasonValue.rateDayBreakUid)[0];
          if (daybreak) {
            newRowdata[`${daybreak?.periodDaysFrom}-${daybreak?.periodDaysTo}`] = seasonValue.value;
            newRowdata[`${daybreak?.periodDaysFrom}-${daybreak?.periodDaysTo}_uid`] = seasonValue.uid;
            newRowdata[`${daybreak?.periodDaysFrom}-${daybreak?.periodDaysTo}_highlight`] = false;
          }
        }
        if (this.rowData === null)
          this.rowData = [newRowdata]
        else
          this.rowData = this.rowData.concat(newRowdata);
        
        localStorage.setItem('sippData', JSON.stringify({ data: this.rowData }));
        this.sortAlphabetically(this.rowData);
      }
    }
    this.generateAvailalbeVehicle();
  }

  insertNewSipp(): void {
    if (this.newSippCodeUid) {
      let newSipp = this.vehicleCategories.find(i => i.uid === this.newSippCodeUid).code;
      this.rowData = JSON.parse(localStorage.getItem('sippData')).data;
      if (this.rowData && this.rowData.filter(i => i.sipp === newSipp).length > 0) {
        this.notifr.showErrorMessage(MessageCodes.DuplicateCodeError);
      } else {
        let formData = {
          data: [{
            rateSeasonUid: this.seasonUid,
            vehicleCategoryUid: this.newSippCodeUid
          }]
        }
        this.ratesService.createNewVehicleCategory(formData).subscribe((newVehicle: VehicleCategoryDetailModel) => {
          this.categoryUids = this.categoryUids.concat(newVehicle)
          let registeredVehicleUids = this.categoryUids.filter(c => c.rateSeasonUid === this.seasonUid);
          let registeredVehicleCategories = [];
          for (let registeredVehicleUid of registeredVehicleUids) {
            let item = this.vehicleCategories.find(c => c.uid === registeredVehicleUid.vehicleCategoryUid);
            registeredVehicleCategories.push(item);
          }
          this.registeredVehicleCategories = registeredVehicleCategories;
          this.ratesService.sendNewSippCodeSignalSubject({ registeredVehicleCategories: registeredVehicleCategories });
          this.updateSippGrid(newVehicle);
        })
      }
    }
  }

  updateSippGrid(newVehicle: VehicleCategoryDetailModel) {
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      rateSeasonUid: {
        op: "eq",
        value: this.seasonUid
      },
      vehicleCategoryUid: {
        op: "eq",
        value: newVehicle.vehicleCategoryUid
      }
    }
    this.ratesService.getRateSeasonValues(formData).subscribe((rateSeasonValues: RateSeasonValueDetailsModel[]) => {
      this.rateSeasonValueDetails = [...this.rateSeasonValueDetails, ...rateSeasonValues];
      this.buildSippCodeRowData();
    })
  }

  selectSipp() {
    if (this.columnDefs.filter(r => r.field === "select").length === 0) {
      let interColumnDefs = [this.columnDefs[0]];
      for (let i = 1; i < this.columnDefs.length - 2; i++) {
        interColumnDefs = [...interColumnDefs,
        {
          field: "select", headerName: "", editable: true, id: this.columnDefs[i].field,
          cellRenderer: CheckboxCellRendererComponent,
          cellRendererParams: { clicked: (data: any) => { this.highLightCell(data) } },
          width: 10
        }, this.columnDefs[i]]
      }
      interColumnDefs = [...interColumnDefs, this.columnDefs[this.columnDefs.length - 2], this.columnDefs[this.columnDefs.length - 1]];
      this.columnDefs = interColumnDefs;
    }
  }

  highLightCell(obj) {
    if (obj.value) {
      let id = obj.params.colDef.id;
      let newCell = {
        uid: obj.params.data.uid,
        entityVersion: obj.params.data.entityVersion,
        dayBreak: id,
        dayBreak_uid: obj.params.data[id + "_uid"],
        rowIndex: obj.params.rowIndex
      }
      for (let i = 0; i < this.multiUpdateCells.length; i++) {
        if (this.multiUpdateCells[i].uid === newCell.uid && this.multiUpdateCells[i].entityVersion === newCell.entityVersion && this.multiUpdateCells[i].uid === newCell.uid && this.multiUpdateCells[i].dayBreak_uid === newCell.dayBreak_uid) {
          return;
        }
      }
      this.multiUpdateCells.push(newCell)
    } else {
      this.multiUpdateCells = this.multiUpdateCells.filter(r => r.uid !== obj.params.data.uid && r.entityVersion !== obj.params.data.entityVersion);
    }
  }

  updateSipp() {
    let rowData = this.rowData;
    for (let cell of this.multiUpdateCells) {
      let currentValue = rowData[cell.rowIndex][cell.dayBreak];
      let newValue = Number(currentValue) + Number(currentValue) * Number((this.percent ?? 0 )/ 100) + Number(this.amount ?? 0);
      rowData[cell.rowIndex][cell.dayBreak + "_highlight"] = true;
      rowData[cell.rowIndex][cell.dayBreak] = newValue
      cell['value'] = newValue
    }
    this.columnDefs = this.columnDefs.filter(r => r.field !== "select");
    this.rowData = [...rowData];
  }

  selectAllCells() {
    let rowData = this.rowData;
    if (this.columnDefs.filter(r => r.field === "select").length === 0) {
      this.selectSipp();
      for (let i = 0; i < this.rowData.length; i++) {
        Object.keys(this.rowData[i]).map(key => {
          if (key.includes("_uid")) {
            let dayBreak = key.replace("_uid", "");
            rowData[i][dayBreak + "_highlight"] = true;
            let newCell = {
              uid: this.rowData[i].uid,
              entityVersion: this.rowData[i].entityVersion,
              dayBreak: dayBreak,
              dayBreak_uid: this.rowData[i][key],
              rowIndex: i
            }
            this.multiUpdateCells.push(newCell)
          }
        })
      }
    } else {
      for (let i = 0; i < this.rowData.length; i++) {
        Object.keys(this.rowData[i]).map(key => {
          if (key.includes("_uid")) {
            let dayBreak = key.replace("_uid", "");
            rowData[i][dayBreak + "_highlight"] = true;
          }
        })
      }
    }
    this.rowData = [...rowData];
  }

  generateAvailalbeVehicle() {
    this.ratesService.getVehicles(0, 999).subscribe((vehicles) => {
      this.availableVehicleCategories = vehicles.items;
      for (let vehicle of this.availableVehicleCategories) {
        if (this.rowData !== null) {
          if (this.rowData.filter(r => r.sipp === vehicle.code).length !== 0) {
            if (this.availableVehicleCategories.filter(r => r.code === vehicle.code).length !== 0) {
              this.availableVehicleCategories = this.availableVehicleCategories.filter(r => r.code !== vehicle.code);
            }
          }
        }
      }
    })
  }

  areAllValuesNotNullOrEmpty(list) {
    for (let obj of list) {
      if (!Object.values(obj).every(value => value !== null && value !== undefined && value !== '')) {
        return false;
      }
    }
    return true;
  }

  validateSipp(updatedRowData) {
    for (let item of updatedRowData) {
      if (Number(item.value) < 0) {
        return false;
      }
    }
    return true;
  }

  sortAlphabetically(rowData): Array<any> {

    if (rowData !== null) {
      rowData.sort((a, b) => {
        const nameA = a.sipp.toLowerCase();
        const nameB = b.sipp.toLowerCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    }
    return rowData;
  }


  handleNewDayBreakEvent() {
    let interColumnDefs = this.columnDefs
    interColumnDefs.splice(this.columnDefs.length - 2, 0, { headerName: "", field: "daybreakAdd", headerComponentFramework: DayBreakAddComponent, headerComponentParams: { addEventHandler: this.handleNewDayBreakColumnEvent.bind(this), cancelEventHandler: this.handleCancelDayBreakColumnEvent.bind(this) }, width: 120 });
    interColumnDefs[this.columnDefs.length - 1]['headerComponentParams']['isEdit'] = true;
    this.columnDefs = [...interColumnDefs]
  }

  handleNewDayBreakColumnEvent(event) {
    this.hasToAddDaybreaks.push(event);
    let interColumnDefs = this.columnDefs;
    interColumnDefs[interColumnDefs.length - 3] = {
      field: `${event.periodDaysFrom}-${event.periodDaysTo}`, editable: true, cellEditor: NumberCellEditorComponent,
      width: 120, id: 'field', headerComponentFramework: CustomHeaderComponent, headerComponentParams: { uid: event?.uid, editEventHandler: this.handleEditDayBreakEvent.bind(this), deleteEventHandler: this.handleDeleteDayBreakEvent.bind(this) }
    }
    this.columnDefs = [...interColumnDefs]
  }

  handleCancelDayBreakColumnEvent() {
    let interColumnDefs = this.columnDefs;
    interColumnDefs.splice(interColumnDefs.length - 3, 1);
    this.columnDefs = [...interColumnDefs];
  }

  handleEditDayBreakEvent(event) {
    this.hasToUpdateDaybreaks.push(event);
  }

  handleUpdateDayBreakEvent() {
    let interDayBreaks = this.dayBreaks;
    forkJoin([
      this.ratesService.updateRateSeasonDayBreak(this.hasToUpdateDaybreaks),
      this.ratesService.createRateSeasonDayBreak(this.hasToAddDaybreaks)
    ]).subscribe(([updatedDayBreaks, addedDayBreaks]) => {
      for (let item of updatedDayBreaks) {
        let index = interDayBreaks.findIndex(i => i.uid === item.uid);
        interDayBreaks[index] = item;
      }
      this.hasToUpdateDaybreaks = [];
      interDayBreaks = [...interDayBreaks, ...addedDayBreaks]
      this.hasToAddDaybreaks = [];
      this.dayBreaks = [...interDayBreaks];
      localStorage.setItem('daybreaksData', JSON.stringify(this.dayBreaks));
      // this.buildColumn();
      this.updateSeasonValueByDayBreaks();
    })
  }

  updateSeasonValueByDayBreaks() {
    let formData = [];
    if(!this.rowData) return;
    for (let row of this.rowData) {
      formData.push({ uid: row.uid, entityVersion: row.entityVersion });
    }
    this.ratesService.deleteVehicleCategory(formData).subscribe(() => {
      let newFormData = [];
      for (let vehicle of this.categoryUids) {
        newFormData.push({
          rateSeasonUid: this.seasonUid,
          vehicleCategoryUid: vehicle.vehicleCategoryUid
        })
      }
      this.ratesService.createNewVehicleCategory({ data: newFormData }).subscribe(() => {
        this.ratesService.getAllVehicleCategory(this.seasonUid).subscribe((categories: VehicleCategoryDetailModel[]) => {
          this.categoryUids = categories
          let registeredVehicleUids = categories.filter(c => c.rateSeasonUid === this.seasonUid);
          let registeredVehicleCategories = [];
          for (let registeredVehicleUid of registeredVehicleUids) {
            let item = this.vehicleCategories.find(c => c.uid === registeredVehicleUid.vehicleCategoryUid);
            registeredVehicleCategories.push(item);
          }
          this.registeredVehicleCategories = registeredVehicleCategories;
          this.ratesService.sendNewSippCodeSignalSubject({ registeredVehicleCategories: registeredVehicleCategories });
          this.buildSippGrid();
        });
      })
    })
  }

  handleRevertDayBreakChangeEvent() {
    this.dayBreaks = JSON.parse(localStorage.getItem('daybreaksData'));
    this.hasToUpdateDaybreaks = [];
    this.hasToAddDaybreaks = [];
    this.buildColumn();
  }

  handleEditModeEvent(isEdit) {
    if (isEdit) {
      let interColumnDefs = this.columnDefs;
      for (let item of interColumnDefs) {
        if (item.id === 'field') {
          item['headerComponentFramework'] = CustomHeaderComponent;
        }
      }
      this.columnDefs = [...interColumnDefs]
    }
  }

  handleDeleteDayBreakEvent(uid) {
    this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        description: "Are you sure to delete the day break?"
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.isModalShow = false;
      if (result.result === 1) {
        if (uid) {
          let item = this.dayBreaks.find(i => i.uid === uid);
          let formData = { uid: uid, entityVersion: item.entityVersion }
          this.ratesService.deleteRateSeasonDayBreak(formData).subscribe(() => {
            this.columnDefs = this.columnDefs.filter(i => i.uid !== uid)
          })
        }
      }
    })
  }

  resetColumnHeaders() {
    this.columnDefs = this.columnDefs.map(col => {
      col.headerComponentFramework = null;
      return col;
    })
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
