import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { NotificationService } from 'app/shared/services/notification.service';
import { RatesService } from 'app/shared/services/rates/rates.service';

@Component({
  selector: 'app-custom-header',
  templateUrl: './custom-header.component.html',
  styleUrls: ['./custom-header.component.css']
})
export class CustomHeaderComponent implements IHeaderAngularComp {
  constructor(
    private notifr: NotificationService,
    private ratesService: RatesService
  ) {

  }
  refresh(params: IHeaderParams): boolean {
    this.params = params;
    this.firstDay = this.params.displayName.split('-')[0];
    this.secondDay = this.params.displayName.split('-')[1];
    this.params.displayName = this.firstDay + "-" + this.secondDay;
    return true;
  }
  params: any;
  firstDay: string;
  secondDay: string;
  isEdit: boolean = false;

  agInit(params: any): void {
    this.params = params;
    this.firstDay = this.params.displayName.split('-')[0];
    this.secondDay = this.params.displayName.split('-')[1];
  }

  editDayBreak(): void {
    this.isEdit = !this.isEdit;
  }

  deleteDayBreak(): void {
    this.params.deleteEventHandler(this.params.uid);
  }

  checkDayBreak(): void {
    let dayBreaks = JSON.parse(localStorage.getItem('daybreaksData'));
    let index = dayBreaks.findIndex(i => i.uid === this.params.uid);
    if(!this.firstDay || !this.secondDay) {
      this.notifr.showErrorMessage(MessageCodes.AllAreNotFilledError);
      return;
    }
    if(!this.isInteger(this.firstDay) || !this.isInteger(this.secondDay)) {
      this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
      return;
    }
    if (index === 0) {
      if (Number(this.firstDay) < 0 || Number(this.secondDay) > Number(dayBreaks[index + 1].periodDaysFrom)) {
        this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
        return;
      } else {
        if (Number(this.firstDay) > Number(this.secondDay)) {
          this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
          return;
        }
      }
    } else if (index === dayBreaks.length - 1) {
      if (Number(this.firstDay) < dayBreaks[index - 1].periodDaysTo) {
        this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
        return;
      } else {
        if (Number(this.firstDay) > Number(this.secondDay)) {
          this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
          return;
        }
      }
    } else {
      if (Number(this.firstDay) < dayBreaks[index - 1].periodDaysTo || Number(this.secondDay) > dayBreaks[index + 1].periodDaysFrom) {
        this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
        return;
      } else {
        if (Number(this.firstDay) > Number(this.secondDay)) {
          this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
          return;
        }
      }
    }
    let data = { ...dayBreaks[index], periodDaysFrom: this.firstDay, periodDaysTo: this.secondDay }
    this.params.editEventHandler(data);
    // this.ratesService.updateRateSeasonDayBreak(data).subscribe(response => {
    //   dayBreaks[index] = response;
    //   localStorage.setItem('dayBreaksData', JSON.stringify(dayBreaks));
    //   this.isEdit = !this.isEdit;
    //   this.params.displayName = this.firstDay + "-" + this.secondDay;
    // })
    this.isEdit = !this.isEdit;
    this.params.displayName = this.firstDay + "-" + this.secondDay;
  }

  cancelDayBreak(): void {
    let dayBreaks = JSON.parse(localStorage.getItem('daybreaksData'));
    let dayBreak = dayBreaks.find(i => i.uid === this.params.uid);
    this.firstDay = dayBreak.periodDaysFrom;
    this.secondDay = dayBreak.periodDaysTo;
    this.isEdit = !this.isEdit;
  }

  isInteger(num) {
    return num % 1 === 0;
  }

  ngOnDestroy(): void {
    // Cleanup code if needed
  }
}