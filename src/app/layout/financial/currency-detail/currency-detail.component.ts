import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { CurrencyHistoryListItem } from 'app/shared/models/financial/currency-history-list-item.model';
import { CurrencyViewModel } from 'app/shared/models/financial/currency-view.model';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { AuthService } from 'app/shared/services/auth.new.service';
import { CurrencyService } from 'app/shared/services/financial/currency.service';
import { GlobalService } from 'app/shared/services/global.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-currency-detail',
  templateUrl: './currency-detail.component.html',
  styleUrls: ['./currency-detail.component.css']
})
export class CurrencyDetailComponent implements OnInit {

  public formGroup: FormGroup;

  private routeDataSubscription: Subscription; //Used for the current model retrieval from the resolver
  public currentModel: CurrencyViewModel;
  pageWrapper: ListPageWrapper<CurrencyHistoryListItem>;
  history: Array<CurrencyHistoryListItem>;
  public submitted = false;
  public isSubmitting = false;
  public uid: string;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly defaultService: CurrencyService,
    private readonly globalService: GlobalService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService
  ) { }

  ngOnInit() {
    this.routeDataSubscription = this.route.data.subscribe(
      (data: { currency: CurrencyViewModel, history: ListPageWrapper<CurrencyHistoryListItem> }) => {
        this.currentModel = data.currency;
        this.pageWrapper = data.history;
        this.history = data.history?.items;
        // emit to sidebar component that current menu has no subfranchisee menu on create
        this.route.params.subscribe((x) => {
          if (x.uid === 'new') {
            this.globalService.emitFranchiseeDetail(null);
          } else {
            this.globalService.emitFranchiseeDetail(this.currentModel);
          }
        });

        if (this.currentModel) this.createForm();
      },
    );
  }

  // convenience getter for easy access to form fields
  public get fields() {
    return this.formGroup.controls;
  }
  //Applied to a new form
  //Requires unsubscribe
  public createForm() {
    //Form controls creation
    this.formGroup = this.formBuilder.group({
      code: [this.currentModel.code, Validators.required],
      exchangeRate: [this.currentModel.exchangeRate, Validators.required],
      name: [this.currentModel.name],
      unitName: [this.currentModel.unitName],
      decimalName: [this.currentModel.decimalName],
    })
  }

  //Applied after the model saved
  public updateForm() {
    const model = this.currentModel;
    this.formGroup.patchValue({
      code: model.code,
      exchangeRate: model.exchangeRate,
      name: model.name,
      unitName: model.unitName,
      decimalName: model.decimalName,
    });
  }

  //Update the model with the form values
  private applyForm() {
    const formValue = this.formGroup.value;
    this.currentModel.code = formValue.code;
    this.currentModel.exchangeRate = formValue.exchangeRate;
    this.currentModel.name = formValue.name;
    this.currentModel.unitName = formValue.unitName;
    this.currentModel.decimalName = formValue.decimalName;
  }

  //Save the model and update it from the service
  public save() {
    this.submitted = true;
    this.applyForm();
    this.isSubmitting = true;
    if (this.formGroup.status === "VALID") {
      this.formGroup.disable();
      if (this.currentModel.uid) {
        this.defaultService.updateCurrency([this.currentModel]).subscribe(
          (res: { data: CurrencyViewModel[] }) => {
            this.isSubmitting = false;
            this.formGroup.enable();
            this.notificationService.showSuccessMessage(MessageCodes.FranchiseeSaveSuccess);
            void this.router.navigateByUrl(`/financial/currency/${res.data[0].uid}`);
          },
          (err) => {
            if (err.status === 401) {
              this.notificationService.showErrorMessage(MessageCodes.NotAuthorizedError);
              void this.router.navigateByUrl('/');
            }
            this.isSubmitting = false;
            this.formGroup.enable();
            throw err;
          },
        );
      } else {
        this.defaultService.saveCurrency([this.currentModel]).subscribe(
          (res: { data: CurrencyViewModel[] }) => {
            this.isSubmitting = false;
            this.formGroup.enable();
            this.notificationService.showSuccessMessage(MessageCodes.FranchiseeSaveSuccess);
            //this.currentModel = res;
            //this.updateForm();
            void this.router.navigateByUrl(`/financial/currency/${res.data[0].uid}`);
          },
          (err) => {
            if (err.status === 401) {
              this.notificationService.showErrorMessage(MessageCodes.NotAuthorizedError);
              void this.router.navigateByUrl('/');
            }
            this.isSubmitting = false;
            this.formGroup.enable();
            throw err;
          },
        );
      }
    }
  }

  //Validate the control
  private get isValid(): boolean {
    return this.formGroup.valid;
  }

  //Unsubscribe from subscriptions here
  public ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe();
    }
  }

}
