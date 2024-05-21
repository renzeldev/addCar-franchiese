import { Component, Input, OnInit } from '@angular/core';
import { DeleteButtonCellComponent } from 'app/shared/components/editable-grid/delete-button-cell/delete-button-cell.component';
import { BrokerGridDecorator } from '../rates-general/grid-decorators/broker-grid-decorator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BrokerItem, RateBrokerItem } from 'app/shared/models/broker-list-item.model';
import { BrokerService } from 'app/shared/services/broker/broker.service';
import { CountryService } from 'app/shared/services/financial/country.service';
import { ReservationListItem } from 'app/shared/models/reservation/reservation-list-item.model';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { ConfirmationModalComponent } from '../rates-general/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-rates-brokers',
  templateUrl: './rates-brokers.component.html',
  styleUrls: ['./rates-brokers.component.css']
})
export class RatesBrokersComponent implements OnInit {

  @Input() countries: ReservationListItem[]
  @Input() rateUid: string
  brokers: BrokerItem[] = [];
  countryBrokers: BrokerItem[] = [];
  
  brokerCountryUid: string
  selectedBrokerUid: string
  public formGroup: FormGroup;
  rowData: RateBrokerItem[] = [];
  newBrokerPrototype = {
    brokerName: ""
  };
  brokerDecorator = new BrokerGridDecorator()

  columnDefs = [
    { field: 'brokerName', headerName:"Brokers", editable: true, },
    { headerName:"Action", cellRenderer: DeleteButtonCellComponent, cellRendererParams: { clicked: (data: any) => { this.deleteRateBroker(data) }}, width: 120 }
  ]
  isModalShow: boolean = false;
  dialogRef: any
  constructor(
    private formBuilder: FormBuilder,
    private brokerService: BrokerService,
    private countryService: CountryService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      
    });
    this.brokerService.getBrokers().subscribe((response: BrokerItem[]) => {
      this.brokers = response;
    })

    this.brokerService.getRateBrokers(this.rateUid).subscribe((response: RateBrokerItem[]) => {
      if(response.length === 0)
        this.rowData = null;
      else
        this.rowData = response;
    })

  }

  addBroker(): void {
    if(this.rateUid && this.selectedBrokerUid) {
      this.brokerService.addRateBroker(this.rateUid, this.selectedBrokerUid).subscribe((res) => {
        if(res) {
          let addedBroker = this.brokers.filter( i => i.uid === this.selectedBrokerUid)[0];
          if(this.rowData === null)
            this.rowData = [{...res, rateUid: this.rateUid, brokerUid: addedBroker.uid, brokerName: addedBroker.name}]
          else
            this.rowData = this.rowData.concat({...res, rateUid: this.rateUid, brokerUid: addedBroker.uid, brokerName: addedBroker.name});
        }
      })
    }
  }

  deleteRateBroker(data) {
    this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        description: "Are you sure you want to remove this broker?"
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.isModalShow = false;
      if (result.result === 1) {
        this.brokerService.deleteRateBroker(data.uid, data.entityVersion).subscribe(() => {
          this.rowData = this.rowData.filter(r => r.uid !== data.uid);
          if(this.rowData.length === 0)
            this.rowData = null
        })
      }
    })
  }

  filterBrokers(): void {
    if(this.brokerCountryUid) {
      this.countryBrokers = this.brokers.filter(i => i.countryUid === this.brokerCountryUid);
    }
  }

}
