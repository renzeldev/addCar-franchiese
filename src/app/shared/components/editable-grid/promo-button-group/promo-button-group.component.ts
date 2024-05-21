import { Component, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-promo-button-group',
  templateUrl: './promo-button-group.component.html',
  styleUrls: ['./promo-button-group.component.css']
})
export class PromoButtonGroupComponent implements ICellEditorAngularComp {

  private params: any;
  public editingStatus: boolean = false;
  public editingSeasonStatus: boolean = false;
  public gridSubscription$: Subscription

  constructor(
    private ratesService: RatesService
  ) {}
  getValue() {
    // throw new Error('Method not implemented.');
  }

  ngOnInit() {
    this.gridSubscription$ = this.ratesService.getGridChangedSubject().subscribe((changedGrid: any) => {
      if(changedGrid && changedGrid.type === 'promo' && this.params?.data?.uid === changedGrid?.data?.uid) {
        this.editingStatus = changedGrid.rowEditing;
      }
    })
  }

  agInit(params: any): void {
    this.params = params;
  }

  btnTrashClickedHandler() {
    this.ratesService.sendDeleteRateSeasonSubject(this.params);
  }

  btnEditClickedHandler() {
    this.editingStatus = true;
    this.ratesService.sendSelectRateSeasonSubject(this.params);
  }

  btnCheckClickedHandler() {
    this.editingStatus = false;
    this.ratesService.sendCreateRateSeasonSubject(this.params);
  }

  btnCloseClickedHandler() {
    this.editingStatus = false;
    this.ratesService.sendCancelRateSeasonSubject(this.params)
  }

  ngOnDestroy() {
    this.gridSubscription$.unsubscribe()
  }

}
