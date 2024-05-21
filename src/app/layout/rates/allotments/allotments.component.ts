import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FleetGridDecorator } from './grid-decorators/fleet-grid-decorator';
import { GlobalService } from 'app/shared/services/global.service';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { Subject, forkJoin } from 'rxjs';
import { GroupListItem } from 'app/shared/models/financial/group-list-item.model';
import { AvailableVehicle } from 'app/shared/models/rates/vehicle-available.model';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { DropdownCellEditorComponent } from "app/shared/components/editable-grid/dropdown-cell-editor/dropdown-cell-editor.component";
import { DateCellEditorComponent } from "app/shared/components/editable-grid/date-cell-editor/date-cell-editor.component";
import { CheckboxCellEditorComponent } from "app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component";
import { NumberCellEditorComponent } from 'app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component';
import { EditRemoveButtonGroupComponent } from 'app/shared/components/editable-grid/edit-remove-button-group/edit-remove-button-group.component';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'app/shared/services/notification.service';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../rates-general/confirmation-modal/confirmation-modal.component';
import { CountryService } from 'app/shared/services/financial/country.service';
import { CountryViewModel } from 'app/shared/models/financial/country-view.model';
import { LocationListItem } from 'app/shared/models/location-list-item.model';
import { LocationService } from 'app/shared/services/location/location.service';


@Component({
  selector: 'app-allotments',
  templateUrl: './allotments.component.html',
  styleUrls: ['./allotments.component.css']
})
export class AllotmentsComponent implements OnInit {

  public formGroup: FormGroup;

  public fleetDecorator: any;
  public carGroups: GroupListItem[] = [];
  public availableCarGroups: GroupListItem[] = [];

  public rowData: any[] = null;

  public newFleetRowPrototype = { vehicleCategoryUid: null, availableCount: null, availableStartDate: null, availableEndDate: null, isFreeSell: false, isOnRequest: false };
  public newRowEmitter = new EventEmitter<any>();
  public autoEditRowEmitter = new EventEmitter<any>();

  public stopRowEditiingEmitter = new EventEmitter<any>();

  public isModalShow: boolean = false;
  public dialogRef: any

  public countries: CountryViewModel[] = []
  public locations: LocationListItem[] = []

  public countryUid: string
  public locationUid: string

  public columnDefs = [
    { field: 'vehicleCategoryUid', editable: true, cellEditor: DropdownCellEditorComponent, cellEditorParams: { options: this.carGroups }, valueFormatter: (params) => { return this.carGroups.find(i => i.uid === params.value)?.code } },
    { field: 'availableCount', editable: true, cellEditor: NumberCellEditorComponent },
    { field: 'availableStartDate', editable: true, cellEditor: DateCellEditorComponent, width: 170 },
    { field: 'availableEndDate', editable: true, cellEditor: DateCellEditorComponent, width: 170 },
    { headerName: 'On Sell', field: 'isFreeSell', editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
    { field: 'isOnRequest', editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
    { field: "allotment", headerName: "Action", cellRenderer: EditRemoveButtonGroupComponent, width: 80 }
  ];

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly globalService: GlobalService,
    private readonly ratesService: RatesService,
    private readonly countryService: CountryService,
    private readonly locationService: LocationService,
    private readonly notifr: NotificationService,
    private readonly dialog: MatDialog
  ) {
    this.fleetDecorator = new FleetGridDecorator(this.ratesService);
  }

  // convenience getter for easy access to form fields
  public get fields() {
    return this.formGroup.controls;
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      client: [null],
      start_date: [],
      end_date: []
    });
    this.globalService.getRateInfoCreateSbj().subscribe((code) => {
      if (code === 'allotment-create') {
        this.newRowEmitter.emit('new');
      }
    })
    forkJoin([this.ratesService.getVehicles(0, 999), this.countryService.getCountries("1", 999)])
      .subscribe(([vehicles, countries]: [ListPageWrapper<GroupListItem>, ListPageWrapper<CountryViewModel>]) => {
        this.carGroups = vehicles.items
        this.countries = countries.items;
        if (this.countries.length === 0) return;
        this.countryUid = this.countries[0].uid;
        this.locationService.getLocations(1, 999, null, null, this.countryUid).subscribe((response: ListPageWrapper<LocationListItem>) => {
          this.locations = response.items;
          if (this.locations.length === 0) return;
          this.locationUid = this.locations[0].uid;
          this.ratesService.getAvailableVehicles(null, this.locationUid).subscribe((response: AvailableVehicle[]) => {
            if (response.length === 0) {
              this.rowData = null;
              this.availableCarGroups = this.carGroups;
            } else {
              this.rowData = response;
              this.availableCarGroups = this.carGroups.filter(i => response.filter(j => j.vehicleCategoryUid === i.uid).length === 0);
            }
            this.columnDefs[0]['cellEditorParams'] = { options: this.availableCarGroups };
            this.columnDefs = [...this.columnDefs];
          })
        })
      })

    this.ratesService.getCreateRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "allotment") {
          this.stopRowEditiingEmitter.emit("data");
        }
      })

    this.ratesService.getSelectRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "allotment") {
          this.autoEditRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data })
        }
      })

    this.ratesService.getCancelRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "allotment") {
          this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
            data: {
              description: "Please confirm that you want to cancel all changes?"
            }
          });
          this.dialogRef.afterClosed().subscribe(result => {
            this.isModalShow = false;
            if (result.result === 1) {
              this.stopRowEditiingEmitter.emit("stop");
              // this.autoSelectRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data });
            } else {
              this.autoEditRowEmitter.emit({ rowIndex: param.rowIndex, data: param.data })
            }
          })
        }
      })

    this.ratesService.getGridChangedSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((changedGrid) => {
        if (changedGrid && changedGrid.type === "allotment" && !changedGrid.rowEditing) {
          let newData = { ...changedGrid.data, locationUid: this.locationUid };
          if (this.isDataValidated(newData)) {
            this.ratesService.createAvailableVehicle(newData).subscribe((response) => {
              if (this.rowData) {
                this.rowData[this.rowData.length - 1] = response;
                this.rowData = [...this.rowData];
              } else {
                this.rowData = [response];
              }
            })
          }
          this.availableCarGroups = this.availableCarGroups.filter(i => i.uid !== changedGrid.data.vehicleCategoryUid);
          this.columnDefs[0]['cellEditorParams'] = { options: this.availableCarGroups };
          this.columnDefs = [...this.columnDefs];
        }
      })

    this.ratesService.getRowDataSubject()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((param) => {
        if (param.colDef.field === "allotment") {
          this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
            data: {
              description: "Please confirm that you want to delete this available vehicle?"
            }
          });
          this.dialogRef.afterClosed().subscribe(result => {
            this.isModalShow = false;
            if (result.result === 1) {
              if (param.data.uid) {
                this.ratesService.deleteAvailableVehicle(param.data.uid, param.data.entityVersion).subscribe((result) => {
                  this.rowData = this.rowData.filter(row => row.uid !== param.data.uid);
                  let reavailableVehicle = this.carGroups.find(group => group.uid === param.data.vehicleCategoryUid);
                  this.availableCarGroups = this.availableCarGroups.concat(reavailableVehicle);
                  this.columnDefs[0]['cellEditorParams'] = { options: this.availableCarGroups };
                  this.columnDefs = [...this.columnDefs]
                })
              } else {
                this.rowData = this.rowData.slice(0, -1);
                if(param.data.vehicleCategoryUid) {
                  let reavailableVehicle = this.carGroups.find(group => group.uid === param.data.vehicleCategoryUid);
                  this.availableCarGroups = this.availableCarGroups.concat(reavailableVehicle);
                  this.columnDefs[0]['cellEditorParams'] = { options: this.availableCarGroups };
                  this.columnDefs = [...this.columnDefs]
                }
              }
            }
          })
        }
      })
  }

  public save() {

  }

  isDataValidated(data: AvailableVehicle): boolean {
    if (!data.availableCount || !data.availableEndDate || !data.availableStartDate || !data.vehicleCategoryUid) {
      this.notifr.showErrorMessage(MessageCodes.AllAreNotFilledError)
      return false;
    }
    if (new Date(data.availableStartDate).getTime() > new Date(data.availableEndDate).getTime()) {
      this.notifr.showErrorMessage(MessageCodes.InvalidParameterError)
      return false;
    }
    if (!this.locationUid) {
      this.notifr.showError("Please select the location.");
      return false;
    }
    return true;
  }

  insertFleet() {
    this.newRowEmitter.emit('new');
  }

  selectCountry() {
    if (this.countryUid) {
      this.locationService.getLocations(1, 999, null, null, this.countryUid).subscribe((response: ListPageWrapper<LocationListItem>) => {
        this.locations = response.items;
      })
    }
  }

  selectLocation() {
    if (this.locationUid) {
      this.ratesService.getAvailableVehicles(null, this.locationUid).subscribe((response: AvailableVehicle[]) => {
        if (response.length === 0) {
          this.rowData = [];
          this.availableCarGroups = this.carGroups;
        }
        else {
          this.rowData = [...response];
          this.availableCarGroups = this.carGroups.filter(i => response.filter(j => j.vehicleCategoryUid === i.uid).length === 0);
        }
        this.columnDefs[0]['cellEditorParams'] = { options: this.availableCarGroups };
        this.columnDefs = [...this.columnDefs];
      })
    }
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
