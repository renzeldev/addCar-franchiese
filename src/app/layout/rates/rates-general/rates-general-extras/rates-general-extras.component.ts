import { Component, EventEmitter, OnInit, Input, SimpleChanges } from '@angular/core';
import { ExtraGridDecorator } from '../grid-decorators/extra-grid-decorator';
import { ExtraCheckDecorator } from '../grid-decorators/extra-check-decorator';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { NumberCellEditorComponent } from 'app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component';
import { CheckboxCellEditorComponent } from 'app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component';
import { EditButtonCellComponent } from 'app/shared/components/editable-grid/edit-button-cell/edit-button-cell.component';
import { DropdownCellEditorComponent } from 'app/shared/components/editable-grid/dropdown-cell-editor/dropdown-cell-editor.component';
import { CellEditorComponent } from 'ag-grid-community/dist/lib/components/framework/componentTypes';
import { RateSeasonExtrasListModel, RateSeasonExtrasValueDetailsModel } from 'app/shared/models/rates/rates-season-view.model';
import { VehicleCategoryDetailModel, VehicleModel } from 'app/shared/models/rates/vehicle-category-model';
import { NotificationService } from 'app/shared/services/notification.service';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { SippButtonGroupComponent } from 'app/shared/components/editable-grid/sipp-button-group/sipp-button-group.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-rates-general-extras',
  templateUrl: './rates-general-extras.component.html',
  styleUrls: ['./rates-general-extras.component.css']
})
export class RatesGeneralExtrasComponent implements OnInit {


  @Input() discardRowDataChange: any
  @Input() isRowEditing: boolean
  @Input() cancelSeasonChangeEmitter: any
  vehicleCategories: VehicleModel[] = []
  newExtraRowPrototype: any;
  newExtraCheckPrototype: any;
  newRowEmitter = new EventEmitter<any>();
  newExtraCheckEmitter = new EventEmitter<any>();
  autoEditRowEmitter = new EventEmitter<any>();
  autoEditCheckRowEmitter = new EventEmitter<any>();
  stopRowEditiingEmitter = new EventEmitter<any>();
  extraSubject: Subscription;
  seasonExtras = []
  extras: any[] = []
  availableExtras: any[] = []
  newExtraUid: string
  codeOptions = [];
  columnDefs: any
  checkColumnDefs: any

  newExtraData: any[] = []

  rowData: any[] = null;

  rowCheckData: any[] = null
  rateSeasonUid: string
  // extraDecorator = new ExtraGridDecorator(this.ratesService);
  extraDecorator = new ExtraGridDecorator(this.ratesService)
  extraCheckDecorator = new ExtraCheckDecorator(this.ratesService);

  updatedExtraRowData: any[] = [];
  updatedExtraCheckRowData: any[] = [];
  rateSeasonExtrasValueDetails: RateSeasonExtrasValueDetailsModel[] = [];

  dialogRef: any
  isModalShow: boolean = false

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private route: ActivatedRoute,
    private ratesService: RatesService,
    private notifr: NotificationService,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    localStorage.setItem('extraData', JSON.stringify([]));
    localStorage.setItem('extraCheckData', JSON.stringify([]));
    this.route.params.subscribe((x) => {
      if (Object.keys(x).length === 0) {
        this.rowData = null;
        this.rowCheckData = null;
      }
    });
    this.ratesService.getRemoveRateSeasonSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((uid) => {
        this.rowData = null;
        this.rowCheckData = null;
      })

    let pageInfo = {
      index: 0,
      size: 999
    }
    this.ratesService.getExtras({ pageInfo }).subscribe((extras: any) => {
      this.extras = extras.items;
    })
    this.ratesService.getExtraObservable()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(uid => {
        this.rateSeasonUid = uid;
        this.initializeGrid();
        this.buildGrids(uid);
      })

    this.ratesService.getNewSippCodeSignalSubjet()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data) {
          this.columnDefs = [];
          this.checkColumnDefs = [];
          this.rowData = null;
          this.rowCheckData = null;
          this.buildInitialGrid(data.registeredVehicleCategories);
          this.buildGrids(this.rateSeasonUid);
        }
      })

    this.ratesService.getSelectRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "season") {
          if (this.columnDefs[this.columnDefs.length - 1]?.field !== "extra") {
            this.columnDefs = this.columnDefs.concat({ headerName: "Action", field: "extra", cellRenderer: SippButtonGroupComponent });
            this.checkColumnDefs = this.checkColumnDefs.concat({ headerName: "Action", field: "extraCheck", cellRenderer: EditButtonCellComponent, pinned: "right", width: 100, cellRendererParams: { clickEdit: this.editExtraCheck.bind(this), clickCheck: this.checkExtraCheck.bind(this), clickClose: this.closeExtraCheck.bind(this) } });
          }
        }
        if (param.colDef.field === "extra")
          this.autoEditRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data, type: "extra" })
        if (param.colDef.field === 'extraCheck')
          this.autoEditCheckRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data });
      })

    this.ratesService.getCreateRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(param => {
        this.columnDefs = this.columnDefs?.slice(0, -1);
        this.checkColumnDefs = this.checkColumnDefs?.slice(0, -1);
        if (param.colDef.field === "season" && param.isValidate) {
          if (this.updatedExtraRowData.length > 0) {
            let updateExtraList = [];
            for (let item of this.updatedExtraRowData) {
              Object.keys(item).forEach(key => {
                if (key.includes("_uid")) {
                  let vehicle = key.split("_")[0];
                  let extraValue = this.rateSeasonExtrasValueDetails.filter(i => i.uid === item[key])[0]
                  if (item[vehicle] != extraValue.value) {
                    updateExtraList.push({ ...extraValue, value: item[vehicle] });
                  }
                }
              })
            }
            this.updatedExtraRowData = [];
            this.ratesService.updateRateSeasonExtra(updateExtraList).subscribe((resData: RateSeasonExtrasValueDetailsModel[]) => {
              localStorage.setItem('extraData', JSON.stringify(this.rowData));
              for (let item of resData) {
                let index = this.rateSeasonExtrasValueDetails.findIndex(r => r.uid === item.uid);
                this.rateSeasonExtrasValueDetails[index] = item
              }
              this.notifr.showSuccessMessage(MessageCodes.SeasonSaveSuccess);
            })
          }
          if (this.updatedExtraCheckRowData.length > 0) {
            let updateExtraList = [];
            for (let item of this.updatedExtraCheckRowData) {
              Object.keys(item).forEach(key => {
                if (key.includes("Uid")) {
                  let vehicle = key.split("_")[0];
                  let seasonExtraValue = this.rateSeasonExtrasValueDetails.find(r => r.uid === item[key]);
                  if (this.checkUpdateExtraValue(item, seasonExtraValue, vehicle)) {
                    updateExtraList.push({
                      ...seasonExtraValue, isIncluded: item[`${vehicle}_isIncluded`], isRequired: item[`${vehicle}_isRequired`],
                      hasInvoiceVoucher: item[`${vehicle}_hasInvoiceVoucher`], isValueChangeAllowed: item[`${vehicle}_isValueChangeAllowed`], isAvailable: item[`${vehicle}_isAvailable`],
                      isBreakdown: item[`${vehicle}_isBreakdown`]
                    })
                  }
                }
              })
            }
            this.updatedExtraCheckRowData = [];
            this.ratesService.updateRateSeasonExtra(updateExtraList).subscribe((resData: RateSeasonExtrasValueDetailsModel[]) => {
              localStorage.setItem('extraCheckData', JSON.stringify(this.rowCheckData));
              for (let item of resData) {
                let index = this.rateSeasonExtrasValueDetails.findIndex(r => r.uid === item.uid);
                this.rateSeasonExtrasValueDetails[index] = item
              }
            })
          }
        }
        if (param.colDef.field === "extra" || param.colDef.field === "extraCheck") {
          this.stopRowEditiingEmitter.emit("data");
        }

      })

    this.ratesService.getGridChangedSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(changedGrid => {
        if (changedGrid && changedGrid.type === 'extra') {
          if (!changedGrid.rowEditing) {
            this.updatedExtraRowData.push(changedGrid.data);
          }
        }
        if (changedGrid && changedGrid.type === 'extraCheck') {
          if (!changedGrid.rowEditing) {
            this.updatedExtraCheckRowData.push(changedGrid.data);
          }
        }
      })

    this.cancelSeasonChangeEmitter?.subscribe((param) => {
      if (param) {
        this.columnDefs = this.columnDefs.splice(0, -1);
        this.checkColumnDefs = this.checkColumnDefs.splice(0, -1);
        // this.rowData = JSON.parse(localStorage.getItem('sippData')).data;
        if (param.colDef.field === "season") {
          this.rowData = JSON.parse(localStorage.getItem('extraData'));
          this.rowCheckData = JSON.parse(localStorage.getItem('extraCheckData'));
        }
      }
    })

    this.ratesService.getCancelRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "extra") {
          if (this.updatedExtraRowData.filter(r => r.code === param.data.code).length === 0) {
            this.stopRowEditiingEmitter.emit('data');
          } else {
            this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
              data: {
                description: "Please confirm that you want to cancel all changes?"
              }
            });
            this.dialogRef.afterClosed().subscribe(result => {
              this.isModalShow = false;
              if (result.result === 1) {
                if (param.data.uid) {
                  let interRowData = this.rowData;
                  interRowData[param.rowIndex] = JSON.parse(localStorage.getItem('extraData')).filter(r => r.uid === param.data.uid)[0];
                  this.rowData = [...interRowData]
                } else {
                  let interRowData = this.rowData;
                  interRowData[param.rowIndex] = { ...this.newExtraRowPrototype, code: interRowData[param.rowIndex].code }
                  this.rowData = [...interRowData]
                }
              } else {
                this.autoEditRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data })
              }
            })
          }
        }
        if (param.colDef.field === "extraCheck") {
          if (this.updatedExtraCheckRowData.filter(r => r.ExtraCode === param.data.ExtraCode).length === 0) {
            this.stopRowEditiingEmitter.emit('data');
          } else {
            this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
              data: {
                description: "Please confirm that you want to cancel all changes?"
              }
            });
            this.dialogRef.afterClosed().subscribe(result => {
              this.isModalShow = false;
              if (result.result === 1) {
                if (param.data.uid) {
                  let interRowData = this.rowCheckData;
                  interRowData[param.rowIndex] = JSON.parse(localStorage.getItem('extraCheckData')).filter(r => r.uid === param.data.uid)[0];
                  this.rowData = [...interRowData]
                  let index = this.updatedExtraCheckRowData.findIndex(r => r.ExtraCode === param.data.ExtraCode);
                  this.updatedExtraCheckRowData.splice(index, 1);
                } else {
                  let interRowData = this.rowCheckData;
                  interRowData[param.rowIndex] = { ...this.newExtraCheckPrototype, ExtraCode: interRowData[param.rowIndex].ExtraCode }
                  this.rowCheckData = [...interRowData]
                  let index = this.updatedExtraCheckRowData.findIndex(r => r.ExtraCode === param.data.ExtraCode);
                  this.updatedExtraCheckRowData.splice(index, 1);
                }
              } else {
                this.autoEditCheckRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data, type: 'extraCheck' })
              }
            })
          }
        }
      })

    this.ratesService.getDeleteRateSeasonSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "extra") {
          this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
            data: {
              description: "Please confirm that you want to remove this extras?"
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
              this.ratesService.deleteRateSeasonExtras(formData).subscribe((res) => {
                this.rowData = this.rowData.filter(r => r.uid !== param.data.uid);
                this.rowCheckData = this.rowCheckData.filter(r => r.uid !== param.data.uid);
                localStorage.setItem("extraData", JSON.stringify(this.rowData));
                localStorage.setItem("extraCheckData", JSON.stringify(this.rowCheckData));
                if (this.rowCheckData.length === 0) this.rowCheckData = null;
                if (this.rowData.length === 0) this.rowData = null;
                this.generateAvailableExtras();
              })
            }
          })
        }
      })
  }

  initializeGrid() {
    this.columnDefs = [];
    this.checkColumnDefs = [];
    this.rowData = null;
    this.rowCheckData = null;
    this.ratesService.getRegisteredVehicleCategories()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (!data.type || data.type !== 'other')
          return;
        this.buildInitialGrid(data.registeredVehicleCategories);
      })

  }

  buildInitialGrid(vehicleCategories) {
    this.vehicleCategories = vehicleCategories;
    let newExtraRowPrototype = { code: '', 'maxValues': 0, };
    this.rowData = null;
    this.rowCheckData = null;
    let columnDefs = [];
    columnDefs.push(
      { field: 'code', headerName: 'Extra Code', editable: false, },
      { field: 'maxValues', editable: true, cellEditor: NumberCellEditorComponent }
    );
    let checkColumnDefs = [];
    checkColumnDefs.push({ headerName: 'Extra Code', field: 'ExtraCode', editable: false, });
    let newExtraCheckPrototype = { ExtraCode: '' };
    for (var i = 0; i < this.vehicleCategories.length; i++) {
      newExtraRowPrototype[this.vehicleCategories[i].code] = 0;
      columnDefs.push({ field: this.vehicleCategories[i].code, editable: true, width: 160, cellEditor: NumberCellEditorComponent })
      newExtraCheckPrototype[`${this.vehicleCategories[i].code}_isValueChangeAllowed`] = null;
      newExtraCheckPrototype[`${this.vehicleCategories[i].code}_isIncluded`] = null;
      newExtraCheckPrototype[`${this.vehicleCategories[i].code}_isRequired`] = null;
      newExtraCheckPrototype[`${this.vehicleCategories[i].code}_hasInvoiceVoucher`] = null;
      newExtraCheckPrototype[`${this.vehicleCategories[i].code}_isAvailable`] = null;
      newExtraCheckPrototype[`${this.vehicleCategories[i].code}_isBreakdown`] = null;
      let newColumnGroup = [];
      newColumnGroup.push({ headerName: `Value Change`, field: `${this.vehicleCategories[i].code}_isValueChangeAllowed`, editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' }, width: 120 })
      newColumnGroup.push({ headerName: 'Included', field: `${this.vehicleCategories[i].code}_isIncluded`, editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' }, width: 100 })
      newColumnGroup.push({ headerName: 'Mandatory', field: `${this.vehicleCategories[i].code}_isRequired`, editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' }, width: 120 })
      newColumnGroup.push({ headerName: 'Invoice', field: `${this.vehicleCategories[i].code}_hasInvoiceVoucher`, editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' }, width: 100 },)
      newColumnGroup.push({ headerName: 'Not Available', field: `${this.vehicleCategories[i].code}_isAvailable`, editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' }, width: 120 })
      newColumnGroup.push({ headerName: 'Is Breakdown', field: `${this.vehicleCategories[i].code}_isBreakdown`, editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' }, width: 120 });
      checkColumnDefs.push({
        headerName: this.vehicleCategories[i].code,
        children: newColumnGroup
      },)
    }
    this.newExtraRowPrototype = newExtraRowPrototype;
    this.newExtraCheckPrototype = newExtraCheckPrototype;
    this.columnDefs = [...columnDefs];
    this.checkColumnDefs = [...checkColumnDefs]
  }

  buildGrids(rateSeasonUid) {
    this.rowCheckData = null;
    this.rowData = null;
    this.ratesService.getRateSeasonExtra(rateSeasonUid).subscribe(seasonExtras => {
      this.seasonExtras = seasonExtras;
      if (this.seasonExtras && this.seasonExtras.length > 0) {
        let rowData = [];
        let rowCheckData = [];
        this.ratesService.getRateSeasonExtraValues(rateSeasonUid).subscribe((values: RateSeasonExtrasValueDetailsModel[]) => {
          this.rateSeasonExtrasValueDetails = values;
          for (let i = 0; i < this.seasonExtras.length; i++) {
            if (this.seasonExtras[i]) {
              rowData.push(this.generateExtraData(this.seasonExtras[i], values));
              rowCheckData.push(this.generateExtraCheckData(this.seasonExtras[i], values));
            }
          }
          this.rowData = this.sortAlphabetically(rowData);
          this.rowCheckData = rowCheckData;
          localStorage.setItem('extraData', JSON.stringify(this.rowData));
          localStorage.setItem('extraCheckData', JSON.stringify(this.rowCheckData));
          this.generateAvailableExtras();
        })
      } else {
        this.rowCheckData = null;
        this.rowData = null;
        this.availableExtras = [...this.extras];
        localStorage.setItem('extraData', JSON.stringify([]));
        localStorage.setItem('extraCheckData', JSON.stringify([]));
      }
    })
  }

  generateExtraData(extra, values) {
    let newRowData = { code: extra.code, maxValues: 0, uid: extra.uid, entityVersion: extra.entityVersion }
    let extrasFilter = values.filter(v => v.extrasUid === extra.extrasUid);
    for (var i = 0; i < extrasFilter.length; i++) {
      let vehicle = this.vehicleCategories.filter(v => v.uid === extrasFilter[i].vehicleCategoryUid)[0]
      if (vehicle) {
        newRowData[vehicle?.code] = extrasFilter[i].value
        newRowData[vehicle?.code + "_uid"] = extrasFilter[i].uid
      }
    }
    return newRowData;
  }

  generateExtraCheckData(extra, values) {
    let newRowData = { ExtraCode: extra.code, uid: extra.uid }
    let extrasFilter = values.filter(v => v.extrasUid === extra.extrasUid);
    for (var i = 0; i < extrasFilter.length; i++) {
      let vehicle = this.vehicleCategories.filter(v => v.uid === extrasFilter[i].vehicleCategoryUid)[0];
      newRowData[`${vehicle?.code}_isValueChangeAllowed`] = extrasFilter[i].isValueChangeAllowed;
      newRowData[`${vehicle?.code}_isIncluded`] = extrasFilter[i].isIncluded;
      newRowData[`${vehicle?.code}_isRequired`] = extrasFilter[i].isRequired;
      newRowData[`${vehicle?.code}_hasInvoiceVoucher`] = extrasFilter[i].hasInvoiceVoucher;
      newRowData[`${vehicle?.code}_isAvailable`] = extrasFilter[i].isAvailable;
      newRowData[`${vehicle?.code}_isBreakdown`] = extrasFilter[i].isBreakdown;
      newRowData[`${vehicle?.code}_Uid`] = extrasFilter[i].uid;
    }
    return newRowData;
  }

  insertNewExtra() {
    let extraCode = this.extras.filter(r => r.uid === this.newExtraUid)[0].code;

    if (!this.newExtraUid) {
      this.notifr.showErrorMessage(MessageCodes.AllAreNotFilledError);
    } else {
      let newExtraCheckPrototype = { ...this.newExtraCheckPrototype };
      newExtraCheckPrototype.ExtraCode = extraCode;
      let newExtraRowPrototype = { ...this.newExtraRowPrototype }
      newExtraRowPrototype.code = extraCode
      let formData = {
        data: [
          {
            rateSeasonUid: this.rateSeasonUid,
            extrasUid: this.newExtraUid
          }
        ]
      }
      this.ratesService.createRateSeasonExtra(formData).subscribe((res) => {
        this.ratesService.getRateSeasonExtraValues(res.data[0].seasonUid).subscribe((values: RateSeasonExtrasValueDetailsModel[]) => {
          if (!this.rowData)
            this.rowData = [this.generateExtraData(res.data[0], values)]
          else
            this.rowData = this.rowData.concat(this.generateExtraData(res.data[0], values));
          this.generateAvailableExtras();
          if (this.rowCheckData)
            this.rowCheckData = this.rowCheckData.concat(this.generateExtraCheckData(res.data[0], values));
          else
            this.rowCheckData = [this.generateExtraCheckData(res.data[0], values)]
        })
      })
    }
  }

  editExtraCheck(param) {
    this.autoEditCheckRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data, type: 'extraCheck' });
  }

  checkExtraCheck(param) {
    this.stopRowEditiingEmitter.emit('data');
  }

  closeExtraCheck(param) {
    let interExtraCheck = this.rowCheckData;
    let previousExtraCheck = JSON.parse(localStorage.getItem('extraCheckData'));
    interExtraCheck[param.rowIndex] = previousExtraCheck[param.rowIndex];
    this.rowCheckData = [...interExtraCheck];
    let index = this.updatedExtraCheckRowData.findIndex(r => r.ExtraCode === param.data.ExtraCode);
    this.updatedExtraCheckRowData.splice(index, 1);
  }

  sortAlphabetically(rowData): Array<any> {

    rowData.sort((a, b) => {
      const nameA = a.code.toLowerCase();
      const nameB = b.code.toLowerCase();

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

  generateAvailableExtras() {
    this.availableExtras = [];
    for (let item of this.extras) {
      if (this.rowData) {
        if (this.rowData.filter(r => r.code === item.code).length === 0) {
          if (this.availableExtras.filter(r => r.code === item.code).length === 0) {
            this.availableExtras.push(item);
          }
        }
      } else {
        this.availableExtras = this.extras
      }
    }
  }

  checkUpdateExtraValue(rowData, extras, vehicle): boolean {
    if (rowData[`${vehicle}_isValueChangeAllowed`] === extras['isValueChangeAllowed'] && rowData[`${vehicle}_isIncluded`] === extras['isIncluded']
      && rowData[`${vehicle}_isRequired`] === extras['isRequired'] && rowData[`${vehicle}_hasInvoiceVoucher`] === extras['hasInvoiceVoucher']
      && rowData[`${vehicle}_isAvailable`] === extras['isAvailable'] && rowData[`${vehicle}_isBreakdown`] === extras['isBreakdown']) {
      return false;
    } else {
      return true;
    }
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  insertExtraCheck() {
    this.newExtraCheckEmitter.emit('new');
  }
}
