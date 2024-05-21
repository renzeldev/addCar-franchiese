import { Component, OnInit, EventEmitter } from '@angular/core';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { CountryListItem } from 'app/shared/models/financial/country-list-item.model';
import { OnewayGridDecorator } from './oneway-decorator/oneway-grid-decorator';
import { GlobalService } from 'app/shared/services/global.service';
import { LocationService } from 'app/shared/services/location/location.service';
import { LocationListItem } from 'app/shared/models/franchisee/location-list-item.model';

@Component({
  selector: 'app-operations-oneway',
  templateUrl: './operations-oneway.component.html',
  styleUrls: ['./operations-oneway.component.css']
})
export class OperationsOnewayComponent implements OnInit {

  pageWrapper: ListPageWrapper<CountryListItem>;
  locations: LocationListItem[] = [];

  firstStationGroup = ['Abu Dhabi Airport', 'Abu Dhabi Airport1', 'Abu Dhabi Airport2', 'Abu Dhabi Airport3'];
  secondStationGroup = ['Abu Dhabi Office', 'Abu Dhabi Office1', 'Abu Dhabi Office2', 'Abu Dhabi Office3']
  onewayDecorator: any
  
  rowData: any[] = [];

  newOnewayRowPrototype = {locationInUid: null, locationOutUid: null, cost: null, extra: "One way fee", isEnabled: false};
  newRowEmitter = new EventEmitter<any>(); 
  
  pager: any = {};
  query: any;

  locationInUid: string
  locationOutUid: string
  
  constructor(
    private globalService: GlobalService,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.onewayDecorator = new OnewayGridDecorator();
    this.globalService.getRateInfoCreateSbj().subscribe((code) => {
      if(code === 'oneway-create') {
        this.newRowEmitter.emit('new');
      }
    })
    this.locationService.getLocations(1, 999, null, null, null).subscribe((response: ListPageWrapper<LocationListItem>) => {
      this.locations = response.items;
      this.onewayDecorator.firstStationGroups = this.locations;
      this.onewayDecorator.secondStationGroups = this.locations;
    })
  }

  insertOneway() {
    this.newRowEmitter.emit('new');
  }

}
