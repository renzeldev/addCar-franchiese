import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { PagerService } from 'app/shared/common/pager.service';
import { RateListModel } from 'app/shared/models/rates/rates-item-detail.model';
import { RatesListItem } from 'app/shared/models/rates/rates-list-item.model';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { SpinnerOverlayService } from 'app/shared/services/spinner-overlay.service';
import { Subscription } from 'rxjs';
import { ConfirmationModalComponent } from '../rates-general/confirmation-modal/confirmation-modal.component';
import { GlobalService } from 'app/shared/services/global.service';

@Component({
  selector: 'app-rates-list',
  templateUrl: './rates-list.component.html',
  styleUrls: ['./rates-list.component.css']
})
export class RatesListComponent implements OnInit {

  private routeDataSubscription: Subscription;  //Used for the current model retrieval from the resolver
  private queryParamsSubscription: Subscription;
  private subscriptions: Subscription[] = [];
  pageWrapper: ListPageWrapper<RateListModel>;
  rates: Array<RateListModel>;
  pager: any = {};
  query: any;
  isModalShow: boolean = false;
  dialogRef: any

  constructor(
    private globalService: GlobalService,
    private defaultService: RatesService, 
    private pagerService: PagerService, 
    private spinnerService: SpinnerOverlayService, 
    private http: HttpClient,
    private route: ActivatedRoute, 
    private router: Router, 
    private dialog: MatDialog) {
  }

  ngOnInit(): void {

    this.routeDataSubscription = this.route.data.subscribe((data: { rates: ListPageWrapper<RateListModel> }) => {
      this.pageWrapper = data.rates;
      this.rates = data.rates.items;
      this.pager = this.pagerService.getPager(data.rates.totalCount, data.rates.currentPage + 1, data.rates.pageSize);
    });

  }

  onFilter(event) {
    let formData = {
      pageInfo: {
        index: 0,
        size: 999
      },
      keywords: event.keywords,
    }
    
    Object.keys(event).map(key => {
      if (!!event[key])
        formData[key] = {
          op: "eq",
          value: event[key]
        };
    })
    if(event.keywords) {
      formData['keywords'] = event.keywords
    }
    event['isActive'] = event.isActive
    console.log(formData)
    if(!!formData['countryUid'] && formData['countryUid']['value'] === 'all') {
      delete formData['countryUid']
    }
    if(!!formData['currencyUid'] && formData['currencyUid']['value'] === 'all') {
      delete formData['currencyUid']
    }
    this.defaultService.getList(formData).subscribe(data => {
      this.pageWrapper = data;
      this.rates = data.items;
      this.pager = this.pagerService.getPager(data.totalCount, data.currentPage + 1, data.pageSize);
    })
  }

  //Unsubscribe from subscriptions here
  ngOnDestroy() {
    if (this.routeDataSubscription)
      this.routeDataSubscription.unsubscribe();
    if (this.queryParamsSubscription)
      this.queryParamsSubscription.unsubscribe();
  }

  removeRates(uid, entityVersion) {
    let formData = {
      data: [
        {
          uid, entityVersion,
        }
      ],
      force: true
    }
    this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        description: "Please confirm that you want to delete this rate?"
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.isModalShow = false;
      if (result.result === 1) {
        this.defaultService.deleteRates(formData).subscribe(res => {
          this.globalService.reloadPage();
        })
      }
    })
  }

}
