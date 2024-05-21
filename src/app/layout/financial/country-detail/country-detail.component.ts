import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryViewModel } from 'app/shared/models/financial/country-view.model';
import { VehicleModel } from 'app/shared/models/rates/vehicle-category-model';
import { CountryVehicle } from 'app/shared/models/reservation/country-vehicle.model';
import { ReservationListItem } from 'app/shared/models/reservation/reservation-list-item.model';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { AuthService } from 'app/shared/services/auth.new.service';
import { CountryService } from 'app/shared/services/financial/country.service';
import { GlobalService } from 'app/shared/services/global.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.css']
})
export class CountryDetailComponent implements OnInit {

  public formGroup: FormGroup;

  private routeDataSubscription: Subscription; //Used for the current model retrieval from the resolver
  public currentModel: CountryViewModel = new CountryViewModel();
  public submitted = false;
  public isSubmitting = false;
  public uid: string;
  public vehicleCategories: CountryVehicle[]
  public selectedCategory: CountryVehicle; 
  public countryDetailUid: string;
  public changeCategory: EventEmitter<any> = new EventEmitter<any>();
  public submitCategorySetting: EventEmitter<any> = new EventEmitter<any>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly countryService: CountryService,
    private readonly ratesService: RatesService,
    private readonly globalService: GlobalService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService
  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      code: ["", [Validators.required, Validators.maxLength(200)]],
      iso: [""],
      description: [""],
      numericIso: [""],
      phoneCode: [""],
      tax: [0],
      refuelCharge: [0],
      rateMin: [0],
      rateMax: [0],
      missingFuelCharge: [0],
      discountMax: [0],
      penalty: [0],
    })
    // this.routeDataSubscription = this.route.data.subscribe(
    //   (data: { tax: CountryViewModel }) => {
    //     this.currentModel = data.tax;

    //   },
    // );
    this.route.paramMap.subscribe(paramMap => {
      this.countryDetailUid = paramMap['params']['uid'];
      if(!this.countryDetailUid) return;
      this.countryService.getCountry(this.countryDetailUid).subscribe((countryDetail: CountryViewModel) => {
        this.currentModel = countryDetail;
        this.formGroup.patchValue({
          code: countryDetail.code,
          iso: countryDetail.iso,
          description: countryDetail.name,
          numericIso: countryDetail.numericIso,
          phoneCode: countryDetail.phoneCode,
          tax: countryDetail.settings.tax,
          refuelCharge: countryDetail.settings.refuelCharge,
          rateMin: countryDetail.settings.rateMin,
          rateMax: countryDetail.settings.rateMax,
          missingFuelCharge: countryDetail.settings.missingFuelCharge,
          discountMax: countryDetail.settings.discountMax,
          penalty: countryDetail.settings.penalty,
        });
      })
    })
    forkJoin([
      this.ratesService.getVehicles(0, 999),
    ]).subscribe(([vehiclesResponse]) => {
      this.vehicleCategories = vehiclesResponse.items;
    })
  }

  // convenience getter for easy access to form fields
  public get fields() {
    return this.formGroup.controls;
  }
  //Applied to a new form
  //Requires unsubscribe

  //Applied after the model saved
  // public updateForm() {
  //   const model = this.currentModel;
  //   this.formGroup.patchValue({
  //     code: model.code,
  //     tax_rate: model.tax_rate,
  //     description: model.description,
  //     cashMovements: model.cashMovements,
  //     bookKeepingAccount: model.bookKeepingAccount,
  //     unit: model.unit,
  //     decimal: model.decimal,
  //   });
  // }

  //Update the model with the form values
  private applyForm() {
    const formValue = this.formGroup.value;
    console.log(formValue)
    this.currentModel.code = formValue.code;
    this.currentModel.numericIso = formValue.numericIso;
    this.currentModel.iso = formValue.iso;
    this.currentModel.name = formValue.description;
    this.currentModel.phoneCode = formValue.phoneCode;
    this.currentModel.settings.tax = formValue.tax;
    this.currentModel.settings.refuelCharge = formValue.refuelCharge;
    this.currentModel.settings.rateMin = formValue.rateMin;
    this.currentModel.settings.rateMax = formValue.rateMax;
    this.currentModel.settings.penalty = formValue.penalty;
    this.currentModel.settings.discountMax = formValue.discountMax;
    this.currentModel.settings.missingFuelCharge = formValue.missingFuelCharge;
    this.currentModel.settings.isPublicSiteVisible = true;
    this.currentModel.settings.isHiddenInList = true;
  }

  //Save the model and update it from the service
  public save() {
    this.isSubmitting = true;
    this.submitted = true;
    this.applyForm();
    this.submitCategorySetting.emit('submit');
  }

  submit(validated) {
    if(validated) {
      if(this.formGroup.valid) {
        if(this.countryDetailUid) {
          this.countryService.updateCountry(this.currentModel).subscribe((res) => {
            this.isSubmitting = false;
            this.formGroup.enable();
            this.notificationService.showSuccessMessage(MessageCodes.FranchiseeSaveSuccess);
          })
        } else {
          this.countryService.saveCountry(this.currentModel).subscribe((res) => {
            this.isSubmitting = false;
            this.formGroup.enable();
            this.notificationService.showSuccessMessage(MessageCodes.FranchiseeSaveSuccess);
          })
        }
      }
    } else {
      this.isSubmitting = false;
    }
  }

  public onCategoryChange(event) {
    let category = event.value;
    this.changeCategory.emit(category);
  }
  //Validate the control
  private get isValid(): boolean {
    return this.formGroup.valid;
  }

  private loadVehicleCategoryDetail(uid: string) {
    // let categoryItem = this.currentModel.categorySetups.find((item) => item.categoryUID == uid);
    // if (categoryItem) {
    //   this.categoryDetail = categoryItem;
    //   return;
    // }
    // this.defaultService.getCountryCategorySettings(this.defaultService.countryId, uid).subscribe(category => {
    //   this.categoryDetail = category;
    //   this.currentModel.categorySetups.push(category);
    // })
  }

  //Unsubscribe from subscriptions here
  public ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe();
    }
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

}
