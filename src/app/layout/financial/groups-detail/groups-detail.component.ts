import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupViewModel } from 'app/shared/models/financial/group-view.model';
import { MessageCodes } from 'app/shared/models/system/message-codes';
import { GroupService } from 'app/shared/services/financial/group.service';
import { GlobalService } from 'app/shared/services/global.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-groups-detail',
  templateUrl: './groups-detail.component.html',
  styleUrls: ['./groups-detail.component.css']
})
export class GroupsDetailComponent implements OnInit {

  public formGroup: FormGroup;

  private routeDataSubscription: Subscription; //Used for the current model retrieval from the resolver
  public currentModel: GroupViewModel;
  public locationDetailUid: string;
  public referenceSegments: any[]

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly defaultService: GroupService,
    private readonly globalService: GlobalService,
    private readonly route: ActivatedRoute,
    private readonly ratesService: RatesService,
    private readonly notifr: NotificationService,
    private readonly router: Router
  ) {

  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      uid: new FormControl(""),
      entityVersion: new FormControl(""),
      code: new FormControl("", Validators.required),
      description: new FormControl(""),
      excessWithCDW: new FormControl(null, Validators.required),
      excessWithoutCDW: new FormControl(null, Validators.required),
      excessWithSCDW: new FormControl(null, Validators.required),
      excessWithoutTheftInsurance: new FormControl(null, Validators.required),
      excessTheft: new FormControl(null, Validators.required),
      deposit: new FormControl(null, Validators.required),
      details: new FormControl("",),
      referenceSegmentUid: new FormControl(null, Validators.required),
      referenceVersion: new FormControl(""),
      imageUrl: new FormControl(""),
      minimumAge: new FormControl(null, Validators.required),
      seniorAge: new FormControl(null, Validators.required),
      minimumLicenseTime: new FormControl(null, Validators.required),
      ageBreak: new FormGroup({
        begin: new FormControl(null, Validators.required),
        beginIsExcluded: new FormControl(true),
        end: new FormControl(null, Validators.required),
        endIsExcluded: new FormControl(true)
      })
    });
    this.routeDataSubscription = this.route.data.subscribe(
      (data: { detail: GroupViewModel }) => {
        this.route.paramMap.subscribe(paramMap => {
          this.locationDetailUid = paramMap['params']['uid'];
          if (!this.locationDetailUid) return;
          this.currentModel = data.detail;
          this.formGroup.patchValue(this.currentModel)
        })
      },
    );

    this.defaultService.getReferenceSegments().subscribe((segments) => {
      this.referenceSegments = segments;
    })
  }

  save() {
    if (this.formGroup.valid) {
      this.currentModel = this.formGroup.value;
      if (this.currentModel.uid) {
        this.ratesService.updateVehicle(this.currentModel).subscribe((res) => {
          if (res) {
            this.notifr.showSuccess("Group updated successfully");
            this.router.navigate(['/financial/groups', 'page', 1]);
          }
        });
      } else {
        let newForm = { ...this.currentModel };
        delete newForm.uid;
        delete newForm.entityVersion;
        this.ratesService.createVehicle(newForm).subscribe((res) => {
          if (res) {
            this.notifr.showSuccess("Group created successfully");
            this.router.navigate(['/financial/groups', 'page', 1]);
          }
        });
      }
    } else {
      this.notifr.showErrorMessage(MessageCodes.AllAreNotFilledError);
    }
  }

  ngOnDestroy(): void {
    if (this.routeDataSubscription)
      this.routeDataSubscription.unsubscribe();
  }
}
