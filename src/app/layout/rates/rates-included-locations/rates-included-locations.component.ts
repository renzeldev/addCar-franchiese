import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IncludedLocation, LocationListItem } from 'app/shared/models/franchisee/location-list-item.model';
import { LocationService } from 'app/shared/services/location/location.service';
import { ConfirmationModalComponent } from '../rates-general/confirmation-modal/confirmation-modal.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-rates-included-locations',
  templateUrl: './rates-included-locations.component.html',
  styleUrls: ['./rates-included-locations.component.css']
})
export class RatesIncludedLocationsComponent implements OnInit {

  @Input() rateInfo: any
  @Input() rateUid: string
  includedLocations: IncludedLocation[] = []
  selectedLocation: string
  dialogRef: any
  isModalShow: boolean = false;
  availableLocations: LocationListItem[] = []
  locations: LocationListItem[]
  constructor(
    private locationService: LocationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if(this.rateUid) {
      forkJoin([
        this.locationService.getLocations(1, 999, null, null, this.rateInfo.countryUid),
        this.locationService.getRateLocations(this.rateUid)
      ]).subscribe(([locations, includedLocations]) => {
        this.locations = locations.items;
        this.includedLocations = includedLocations;
        console.log(this.locations, this.includedLocations)
        for(let item of this.locations) {
          if(includedLocations.filter(i => i.locationUid === item.uid).length === 0) {
            console.log(item);
            this.availableLocations.push(item);
          }
        }
      })
      // this.locaionService.getLocations(1, 999, null, null, this.rateInfo.countryUid).subscribe((response: ListPageWrapper<LocationListItem>) => {
      //   this.locations = response.items;
      // })
      // this.locationService.getRateLocations(this.rateUid).subscribe((response: IncludedLocation[]) => {
      //   this.includedLocations = response;
      //   console.log(this.includedLocations)
      //   for(let item of this.locations) {
      //     if(response.filter(i => i.locationUid === item.uid).length < 0) {
      //       this.availableLocations.push(item);
      //     }
      //   }
      // })
    }
  }

  addRateLocation(): void {
    if(this.selectedLocation) {
      this.locationService.addRateLocation(this.rateUid, this.selectedLocation).subscribe((res) => {
        let addLocation = this.locations.filter(i => i.uid === res[0].locationUid)[0];
        this.includedLocations = this.includedLocations.concat({...res[0], locationCode:addLocation?.code, locationName: addLocation?.name});
        this.availableLocations = this.availableLocations.filter(i => i.uid !== this.selectedLocation);
        console.log(this.includedLocations)
        this.selectedLocation = ""
      })
    }
  }

  removeRateLocation(location: IncludedLocation) {
    console.log(location)
    this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        description: "Please confirm that you want to delete this season?"
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.isModalShow = false;
      if (result.result === 1) {
        this.locationService.removeRateLocation(location.uid, location.entityVersion).subscribe(() => {
          this.includedLocations = this.includedLocations.filter(i => i.uid !== location.uid);
          let removedLocation = this.locations.filter(i => i.uid === location.locationUid)[0]
          this.availableLocations = this.availableLocations.concat(removedLocation);
        })
      }
    })
  }

}
