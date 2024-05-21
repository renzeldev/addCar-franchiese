import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { NotificationService } from 'app/shared/services/notification.service';
import { RatesService } from 'app/shared/services/rates/rates.service';

@Component({
  selector: 'app-daybreak-add-header',
  templateUrl: './daybreak-add.component.html',
  styleUrls: ['./custom-header.component.css']
})
export class DayBreakAddComponent implements IHeaderAngularComp {

  constructor(
    private notifr: NotificationService,
    private ratesService: RatesService
  ) {

  }
  refresh(params: IHeaderParams): boolean {
    return true;
  }
  params: any;
  firstDay: string;
  secondDay: string;
  isEdit: boolean = false;

  agInit(params: any): void {
    this.params = params;
  }

  checkDayBreak(): void {
    let dayBreaks = JSON.parse(localStorage.getItem('daybreaksData'));
    let lastDayBreak = dayBreaks[dayBreaks.length - 1];
    if(!this.firstDay || !this.secondDay) {
      this.notifr.showErrorMessage(MessageCodes.AllAreNotFilledError);
      return;
    }
    if(!this.isInteger(this.firstDay) || !this.isInteger(this.secondDay)) {
      this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
      return;
    }
    if(Number(this.firstDay) > Number(lastDayBreak.periodDaysFrom) && Number(this.secondDay) > Number(this.firstDay)) {
      let formData = {
        rateUid: lastDayBreak.rateUid,
        periodDaysFrom: this.firstDay,
        periodDaysTo: this.secondDay
      }
      this.params.addEventHandler(formData);
      return;
    } else {
      this.notifr.showErrorMessage(MessageCodes.InvalidParameterError);
      return;
    }
  }

  cancelDayBreak(): void {
    this.params.cancelEventHandler();
  }

  isInteger(num) {
    return num % 1 === 0;
  }

  ngOnDestroy(): void {
    // Cleanup code if needed
  }
}