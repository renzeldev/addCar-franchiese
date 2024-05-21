// Code behind logic for CountryExportExcelComponent

// Initially powered by Stantum Angular Utils.
// Want to dramatically increase your development speed too? Visit https://www.stantum.cz/development-automation

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Converters } from '@app-shared/common/converters';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
//import { DateConverters } from '@app-shared/services/date-converters.helper';
import { ClientControlValidators } from '@app-shared/common/client-control-validators';
import { CountryService } from 'app/shared/services/franchisee/country.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { SpinnerOverlayComponent } from '../../../spinner/spinner-overlay.component';
import { SpinnerOverlayService } from '../../../shared/services/spinner-overlay.service';
import { MessageService } from '../../../shared/services/system/message.service';

@Component({
  selector: 'app-country-export-excel',
  templateUrl: './country-export-excel.component.html'
})

export class CountryExportExcelComponent implements OnInit, OnDestroy {
  public formGroup: FormGroup;

  submitted = false;

  // convenience getter for easy access to form fields
  get fields() { return this.formGroup.controls; }

  constructor(private formBuilder: FormBuilder, private simpleCalendar: NgbCalendar, private defaultService: CountryService,
    private notificationService: NotificationService, private spinnerService: SpinnerOverlayService, private messageService: MessageService) {

  }

  ngOnInit() {
    this.createForm();
    this.loadLists();
  }

  private loadLists() {

  }

  //Applied to a new form
  //Requires unsubscribe
  createForm() {
    //Form controls creation
    this.formGroup = this.formBuilder.group({
      date: new FormControl('', Validators.compose([Validators.required, ClientControlValidators.isNotOlderThan6Months])),
    });

    //Change event subscriptions



  }


  //Save the model and update it from the service
  save() {
    this.submitted = true;
    if (this.isValid()) {
      //this.applyForm();
    }
  }

  enable() {
    this.formGroup.enable();
  }

  disable() {
    this.formGroup.disable();
  }

  //Validate the control
  isValid(): boolean {
    const result = this.formGroup.valid;
    return result;
  }

  onExportCSV(): void {
    //updatedAfter
    this.spinnerService.show("Generating the Excel file");
    let date = this.formGroup.value.date;
    this.defaultService.exportChanges(date).subscribe((data) => {
      this.downloadFile(data);
      this.spinnerService.hide();
      this.notificationService.showSuccess('Exported successfully!');
    }, (err) => {
      this.spinnerService.hide();
      err.error.text().then(a => {
        const msg = JSON.parse(a);
        const msgText = this.messageService.combineMessage(msg);
        this.notificationService.showError(msgText);
      });
    })
  }

  downloadFile(data: any) {
    let blob = new Blob([data], { type: 'application/octet-stream' });

    var downloadURL = window.URL.createObjectURL(data);
    var link = document.createElement('a');
    link.href = downloadURL;
    link.download = "export.xlsx";
    link.click();
  }

  //Unsubscribe from subscriptions here
  ngOnDestroy() {

  }
}
