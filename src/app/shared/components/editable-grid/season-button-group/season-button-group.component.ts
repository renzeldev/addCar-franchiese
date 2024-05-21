import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { NotificationService } from 'app/shared/services/notification.service';
import { RatesService } from 'app/shared/services/rates/rates.service';

@Component({
  selector: 'app-season-button-group',
  templateUrl: './season-button-group.component.html',
  styleUrls: ['./season-button-group.component.css']
})
export class SeasonButtonGroupComponent implements ICellEditorAngularComp, AfterViewInit, OnInit {

  public params: any;
  public editingStatus: boolean = false;

  constructor(
    private ratesService: RatesService,
    private notifr: NotificationService,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.ratesService.getGridChangedSubject().subscribe((changedGrid) => {
      if (changedGrid && changedGrid.type === 'season' && this.params.data.uid === changedGrid.data.uid) {
        this.editingStatus = changedGrid.rowEditing;
      }
    });
  }

  ngAfterViewInit(): void {
  }
  getValue() {
    // throw new Error('Method not implemented.');
  }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }

  btnTrashClickedHandler() {
    this.ratesService.sendDeleteRateSeasonSubject(this.params);
  }

  btnEditClickedHandler() {
    this.editingStatus = true;
    this.ratesService.sendSelectRateSeasonSubject({...this.params, isSeasonEdit: true});
  }

  btnCheckClickedHandler() {
    this.editingStatus = false;
    let params = this.params;
    if (this.isSeasonDateValid(params.data) && this.isSeasonValueValid(params.data)) {
      this.ratesService.sendCreateRateSeasonSubject({ ...params, isValidate: true });
    } else {
      this.ratesService.sendCreateRateSeasonSubject({ ...params, isValidate: false });
    }
  }

  btnCloseClickedHandler() {
    this.ratesService.sendCancelRateSeasonSubject({...this.params, isSeasonEdit: false})
  }

  isSeasonValueValid(season): boolean {
    console.log(season);
    if (season.rateMax < 0 || season.rateMin < 0 || season.discountMax < 0 || season.periodMin < 0)
      return false;
    if (season.periodMin % 1 !== 0)
      return false;
    return true;
  }

  isSeasonDateValid(season): boolean {
    console.log(season);
    if (!season.startDate || !season.endDate || !season.bookingStartDate || !season.bookingEndDate) {
      return false;
    }
    if (new Date(season.startDate).getTime() > new Date(season.endDate).getTime()) {
      return false;
    }
    if (new Date(season.bookingStartDate).getTime() > new Date(season.bookingEndDate).getTime()) {
      console.log(new Date(season.bookingStartDate).getTime(), new Date(season.bookingEndDate).getTime())
      return false;
    }
    if (new Date(season.bookingStartDate).getTime() > new Date(season.endDate).getTime())
      return false;
    return true;
  }

}
