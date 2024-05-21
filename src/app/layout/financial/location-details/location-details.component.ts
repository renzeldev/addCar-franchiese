import { Component, OnInit, ErrorHandler, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, forkJoin, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationService } from '@app-shared/services/notification.service';
import { Converters } from '@app-shared/common/converters';
import { LocationViewModel } from '@app-shared/models/location/location-view-model.model';
import { LocationService } from '@app-shared/services/location/location.service';
import { ClientControlValidators } from '../../../shared/common/client-control-validators';
import { LocationListItem, LocationType } from 'app/shared/models/franchisee/location-list-item.model';
import { BreadcrumbService } from 'app/shared/services/breadcrumb.service';
import { LocationOperatorGridDecorator } from 'app/layout/rates/rates-general/grid-decorators/location-operation-decorator';
import { CheckboxCellEditorComponent } from 'app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component';
import { CountryService } from 'app/shared/services/financial/country.service';
import { ReservationListItem } from 'app/shared/models/reservation/reservation-list-item.model';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { CountryViewModel } from 'app/shared/models/financial/country-view.model';
import { WorkingScheduleGridDecorator } from 'app/layout/rates/rates-general/grid-decorators/working-schedule-decorator';
import { WorkingScheduleModel } from 'app/shared/models/financial/location-working-schedule.model';
import { OperationDataModel } from 'app/shared/models/financial/location-operation-data.model';

@Component({
  selector: 'app-location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.css']
})
export class LocationDetailsComponent implements OnInit, OnDestroy {

  countries: CountryViewModel[] = []

  locationTypes: LocationType[] = [];
  states = []

  public formGroup: FormGroup;
  public location: LocationListItem = new LocationListItem();


  private routeDataSubscription: Subscription;  //Used for the current model retrieval from the resolver
  currentModel: LocationViewModel = new LocationViewModel();
  submitted = false;
  isSubmitting = false;

  locationOperatorGridDecorator = new LocationOperatorGridDecorator();
  workingScheduleGridDecorator = new WorkingScheduleGridDecorator();

  workingScheduleModel = new WorkingScheduleModel();
  operationDataModel = new OperationDataModel();
  
  opertaionalRowData: any[] = [
    {
      extra: 'Road side assistance', mandatory: true, available: false
    },
    {
      extra: 'Bridge tax', mandatory: true, available: false
    },
    {
      extra: 'Sales Commission', mandatory: true, available: false
    },
    {
      extra: 'Ferry Travel Tax', mandatory: true, available: false
    },
    {
      extra: 'Premium zero access', mandatory: true, available: false
    }
  ]

  workingScheduleRowData: any[] = [

  ]

  // convenience getter for easy access to form fields
  get fields() { return this.formGroup.controls; }

  constructor(private formBuilder: FormBuilder,
    private defaultService: LocationService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandler,
    private locationService: LocationService,
    private countryService: CountryService,
    private breadCrumbService: BreadcrumbService) {

  }

  ngOnInit() {
    this.route.params.subscribe((x) => {
      if (!x.uid) {

      } else {
        this.locationService.getLocation(x.uid)
        .subscribe((location: any) => {
          if(location)
            this.currentModel = location;
            this.updateForm()
        })
      }
    });
    forkJoin([
      this.locationService.getLocationType(),
      this.countryService.getCountries('1', 999)
    ]).subscribe(([locaionTypes, countries]: [LocationType[], ListPageWrapper<CountryViewModel>]) => {
      this.locationTypes = locaionTypes;
      this.countries = countries.items;
    })
    this.createForm();
  }

  private loadLists() {

  }

  //Applied to a new form
  //Requires unsubscribe
  createForm() {
    //Form controls creation
    this.formGroup = this.formBuilder.group({
      locationName: new FormControl(null, Validators.required),
      countryName: new FormControl(null, Validators.required),
      locationType: new FormControl(null),
      airportCode: new FormControl(null),
      address: new FormControl(null, Validators.required),
      phone: new FormControl(null),
      zipCode: new FormControl(null, Validators.required),
      mobilePhone: new FormControl(null),
      latitude: new FormControl(null),
      longitude: new FormControl(null),
      timezone: new FormControl(null),
      rateCode: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
      isShownOnSite: new FormControl(),
      city: new FormControl(null, Validators.required),
      fax: new FormControl(),
      email: new FormControl()
    })

    this.disableFields();

    //Change event subscriptions



  }

  //Applied after the model saved
  updateForm() {
    this.formGroup.patchValue({
      locationName: this.currentModel.name,
      countryName: this.currentModel.countryUid,
      locationType: this.currentModel.type,
      airportCode: this.currentModel.code,
      address: this.currentModel.address.address,
      city: this.currentModel.address.city,
      phone: this.currentModel.phone.regular,
      mobilePhone: this.currentModel.phone.mobile,
      latitude: this.currentModel.address.latitude,
      longitude: this.currentModel.address.longitude,
      timezone: this.currentModel.timezone,
      rateCode: this.currentModel.code,
      description: this.currentModel.description,
      zipCode: this.currentModel.address.zipCode
      // isShownOnSite: this.currentModel.isShownOnSite,
    });
    this.disableFields();
  }

  //Update the model with the form values
  private applyForm() {
    this.currentModel.name = this.formGroup.controls["locationName"].value;
    this.currentModel.countryUid = this.formGroup.controls["countryName"].value;
    this.currentModel.code = this.formGroup.controls["rateCode"].value;
    this.currentModel.description = this.formGroup.controls["description"].value;
    this.currentModel.address = {
      address: this.formGroup.controls["address"].value,
      city: this.formGroup.controls["city"].value,
      zipCode: this.formGroup.controls["zipCode"].value,
      latitude: this.formGroup.controls["latitude"].value,
      longitude: this.formGroup.controls["longitude"].value
    };
    this.currentModel.phone = {
      regular: this.formGroup.controls["phone"].value,
      mobile: this.formGroup.controls["mobilePhone"].value,
      fax: this.formGroup.controls["fax"].value
    }
    // this.currentModel.rate = this.formGroup.controls["rate"].value;
    this.currentModel.type = this.formGroup.controls["locationType"].value;
    this.currentModel.timezone = Number(this.formGroup.controls["timezone"].value);
    
  }

  private disableFields() {
    // this.fields.locationName.disable();
    // this.fields.countryName.disable();
    // this.fields.locationType.disable();
    // this.fields.airportCode.disable();
    // this.fields.address.disable();
    // this.fields.phone.disable();
    // this.fields.mobilePhone.disable();
    // this.fields.latitude.disable();
    // this.fields.longitude.disable();
    // this.fields.info.disable();
  }

  //Save the model and update it from the service
  save() {
    this.submitted = true;
    if (this.isValid()) {
      this.applyForm();
      this.isSubmitting = true;
      this.formGroup.disable();
      console.log(this.currentModel)
      if(!this.currentModel.uid){
        this.defaultService.addLocation(this.toValidateForm).subscribe((response: LocationViewModel) => {
          this.isSubmitting = false;
          this.formGroup.enable();
          this.notificationService.showSuccess("Location was successfully saved");
        },
          err => {
            if (err.status === 401) {
              this.notificationService.showError("You are not authorized to perform this action");
              this.router.navigateByUrl("/");
            }
            this.isSubmitting = false;
            this.formGroup.enable();
            this.disableFields();
            throw err;
          })
      } else {
        this.defaultService.updateLocation(this.toValidateForm).subscribe((response: LocationViewModel) => {
          this.isSubmitting = false;
          this.formGroup.enable();
          this.notificationService.showSuccess("Location was successfully saved");
        },
          err => {
            if (err.status === 401) {
              this.notificationService.showError("You are not authorized to perform this action");
              this.router.navigateByUrl("/");
            }
            this.isSubmitting = false;
            this.formGroup.enable();
            this.disableFields();
            throw err;
          })
      }
      
    } else {
      this.notificationService.showErrorMessage(MessageCodes.AllAreNotFilledError);
    }
  }

  //Validate the control
  isValid(): boolean {
    console.log(this.formGroup)
    const result = this.formGroup.valid;
    return result;
  }

  get toValidateForm() {
    let currentModel = this.currentModel;
    Object.keys(currentModel).forEach(key => {
      if(currentModel[key] instanceof Object) {
        Object.keys(currentModel[key]).forEach(subKey => {
          if(!currentModel[key][subKey])
            delete currentModel[key][subKey];
        })
      } else {
        if(!currentModel[key])
          delete currentModel[key];
      }
    })
    return currentModel
  }

  //Unsubscribe from subscriptions here
  ngOnDestroy() {
    if (this.routeDataSubscription)
      this.routeDataSubscription.unsubscribe();
  }

}
