// Code behind logic for CountryCategorySettingsComponent

// Initially powered by Stantum Angular Utils.
// Want to dramatically increase your development speed too? Visit https://www.stantum.cz/development-automation

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Converters } from '@app-shared/common/converters';
import { ClientControlValidators } from '@app-shared/common/client-control-validators';
import { CountryService } from 'app/shared/services/financial/country.service';
import { CountryVehicleCategorySetting } from 'app/shared/models/financial/country-view.model';
import { MessageService } from 'app/shared/services/system/message.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { MessageCodes } from 'app/shared/models/system/message-codes';
// import { VehicleCategoryListItem } from '../../../shared/models/vehicle/vehicle-category-list-item.model';
// import { CountryCategorySetupViewModel } from '../../../shared/models/country/country-category-setup-view-model.model';

@Component({
  selector: 'app-country-category-settings',
  templateUrl: './country-category-settings.component.html'
})

export class CountryCategorySettingsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() countryDetailUid: string
  @Input() changeCategory: EventEmitter<any>
  @Input() submitCategorySetting: EventEmitter<any>
  public formGroup: FormGroup;

  public isCategoryUIDLoading = false;
  public vehicleSettings: any[] = [];
  public selectedCategory: any

  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  submitted = true;
  isUpdating = false;
  formStatus: boolean;

  private categoryUIDChangeHandler;   //This handler is called when categoryUID control changed


  // convenience getter for easy access to form fields
  get fields() { return this.formGroup.controls; }

  constructor(private formBuilder: FormBuilder, private countryService: CountryService, private notificationService: NotificationService) {
    this.formGroup = this.formBuilder.group({
      uid: [''],
      entityVersion: [''],
      modalName: [''],
      isGuaranteedModel: [true],
      guaranteedYear: ['', Validators.required],
      maxMileage: ['', Validators.required],
      fuelPolicty: ['', ],
      doors: ['', Validators.required],
      passengers: ['', Validators.required],
      minDriverAge: ['', Validators.required],
      maxDriverAge: ['', Validators.required],
      isFourWheelDrive: [true],
      requiredDeposit: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.countryService.getCountryVehicleCategorySettings(this.countryDetailUid).subscribe((vehicleSettings) => {
      this.vehicleSettings = vehicleSettings;
    })
    this.changeCategory?.subscribe((category) => {
      this.selectedCategory = category;
      let categorySetting = this.vehicleSettings.find(setting => setting.vehicleCategoryCode === category.code);
      console.log(this.vehicleSettings, category)
      if( !categorySetting ) {
        this.setInitialForm();
      } else {

        this.countryService.getCountryVehicleCategorySettingDetails(categorySetting.uid).subscribe((parameters: CountryVehicleCategorySetting) => {
          this.formGroup.patchValue({
            uid: parameters.uid,
            entityVersion: parameters.entityVersion,
            modalName: parameters.modelName,
            isGuaranteedModel: parameters.isGuaranteedModel,
            guaranteedYear: parameters.guaranteedYear,
            maxMileage: parameters.maxMileage,
            fuelPolicty: parameters.fuelPolicy,
            doors: parameters.doors,
            passengers: parameters.passengers,
            minDriverAge: parameters.minDriverAge,
            maxDriverAge: parameters.maxDriverAge,
            isFourWheelDrive: parameters.isFourWheelDrive,
            requiredDeposit: parameters.requiredDeposit
          })
        })
      }
    })

    this.submitCategorySetting?.subscribe((data) => {
      if(data && this.formGroup.valid) {
        let formData = {
          data: [
            {
              countryUid: this.countryDetailUid,
              vehicleCategoryUid: this.selectedCategory.uid,
              ...this.formGroup.value
            }
          ]
        }
        if(this.formGroup.value.uid) {
          this.countryService.updateCountryVehicleCategorySettingDetails(formData).subscribe((res) => {
            this.onSubmit.emit(true);
          })
        } else {
          this.countryService.createCountryVehicleCategorySettingDetails(formData).subscribe((res) => {
            this.onSubmit.emit(true);
          })
        }
      } else {
        this.notificationService.showErrorMessage(MessageCodes.AllAreNotFilledError);
        this.onSubmit.emit(false);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    
  }

  setInitialForm() {
    this.formGroup.patchValue({
      uid: '',
      entityVersion: '',
      modalName: '',
      isGuaranteedModel: true,
      guaranteedYear: '',
      maxMileage: '',
      fuelPolicty: '',
      doors: '',
      passengers: '',
      minDriverAge: '',
      maxDriverAge: '',
      isFourWheelDrive: true,
      requiredDeposit: ''
    })
  }

  //Applied after the model saved
  updateForm(model) {
    // this.isUpdating = true;
    // this.formGroup.patchValue({
    //   modelName: model.modelName,
    //   guaranteedModel: model.guaranteedModel,
    //   guaranteedYear: model.guaranteedYear,
    //   mileageApplication: model.mileageApplication,
    //   fuelPolicy: model.fuelPolicy,
    //   doors: model.doors,
    //   passengers: model.passengers,
    //   minDriverAge: model.minDriverAge,
    //   maxDriverAge: model.maxDriverAge,
    //   fourWD: model.fourWD,
    //   deposit: model.deposit,
    // });
    // this.isUpdating = false;
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

  //Unsubscribe from subscriptions here
  ngOnDestroy() {
    if (this.categoryUIDChangeHandler)
      this.categoryUIDChangeHandler.unsubscribe();

  }
}
