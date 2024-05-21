import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationModalComponent } from 'app/layout/rates/rates-general/confirmation-modal/confirmation-modal.component';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { PagerService } from 'app/shared/common/pager.service';
import { CountryListItem } from 'app/shared/models/financial/country-list-item.model';
import { CountryService } from 'app/shared/services/financial/country.service';
import { SpinnerOverlayService } from 'app/shared/services/spinner-overlay.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.css']
})
export class CountryListComponent implements OnInit {

  private routeDataSubscription: Subscription;  //Used for the current model retrieval from the resolver
  private queryParamsSubscription: Subscription;
  private subscriptions: Subscription[] = [];
  pageWrapper: ListPageWrapper<CountryListItem>;
  countries: Array<CountryListItem>;
  pager: any = {};
  query: any;

  dialogRef: any
  isModalShow: boolean = false


  constructor(private defaultService: CountryService, private pagerService: PagerService, private spinnerService: SpinnerOverlayService,
    private route: ActivatedRoute, private router: Router, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.routeDataSubscription = this.route.data.subscribe((data: { countries: ListPageWrapper<CountryListItem> }) => {
      this.pageWrapper = data.countries;
      this.countries = data.countries.items;
      this.pager = this.pagerService.getPager(data.countries.totalCount, data.countries.currentPage, data.countries.pageSize);
    });
    
  }

  onFilter() {
    this.router.navigate(['/financial/countries', 'page', 1], { queryParams: this.query })
  }

  deleteCountry(country: CountryListItem) {
    this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        description: "Please confirm that you want to remove this country?"
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.isModalShow = false;
      if (result.result === 1) {
        this.defaultService.deleteCountry(country).subscribe(() => {
          this.router.navigate(['/financial/countries', 'page', 1]);
        });
      }
    })
  }

  //Unsubscribe from subscriptions here
  ngOnDestroy() {
    if (this.routeDataSubscription)
      this.routeDataSubscription.unsubscribe();
    if (this.queryParamsSubscription)
      this.queryParamsSubscription.unsubscribe();
  }

}
