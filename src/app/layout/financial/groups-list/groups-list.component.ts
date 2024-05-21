import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationModalComponent } from 'app/layout/rates/rates-general/confirmation-modal/confirmation-modal.component';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { PagerService } from 'app/shared/common/pager.service';
import { GroupListItem } from 'app/shared/models/financial/group-list-item.model';
import { GroupService } from 'app/shared/services/financial/group.service';
import { GlobalService } from 'app/shared/services/global.service';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { SpinnerOverlayService } from 'app/shared/services/spinner-overlay.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.css']
})
export class GroupsListComponent implements OnInit {

  private routeDataSubscription: Subscription;  //Used for the current model retrieval from the resolver
  private queryParamsSubscription: Subscription;
  private subscriptions: Subscription[] = [];
  pageWrapper: ListPageWrapper<GroupListItem>;
  groups: Array<GroupListItem>;
  pager: any = {};
  query: any;

  dialogRef: any
  isModalShow: boolean = false

  constructor(
    private globalService: GlobalService,
    private ratesService: RatesService, 
    private pagerService: PagerService, 
    private spinnerService: SpinnerOverlayService,
    private route: ActivatedRoute, 
    private router: Router, 
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.routeDataSubscription = this.route.data.subscribe((data: { groups: ListPageWrapper<GroupListItem> }) => {
      this.pageWrapper = data.groups;
      this.groups = data.groups.items;
      this.pager = this.pagerService.getPager(data.groups.totalCount, data.groups.currentPage, data.groups.pageSize);
    });

  }

  onFilter(query) {
    if(query) {
      this.ratesService.getVehicles(0, 999, query).subscribe((res) => {
        this.groups = res.items;
      })
    } else {
      this.globalService.reloadPage();
    }
  }

  deleteVehicle(group: GroupListItem) {

    this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        description: "Please confirm that you want to remove this group?"
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.isModalShow = false;
      if (result.result === 1) {
        this.ratesService.deleteVehicle(group).subscribe((res) => {
          this.globalService.reloadPage();
        });
      }
    })

  }

  reloadPage() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(currentUrl);
    });
  }

  //Unsubscribe from subscriptions here
  ngOnDestroy() {
    if (this.routeDataSubscription)
      this.routeDataSubscription.unsubscribe();
    if (this.queryParamsSubscription)
      this.queryParamsSubscription.unsubscribe();
  }

}
