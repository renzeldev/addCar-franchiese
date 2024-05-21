import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sipp-button-group',
  templateUrl: './sipp-button-group.component.html',
  styleUrls: ['./sipp-button-group.component.css']
})
export class SippButtonGroupComponent implements ICellEditorAngularComp, AfterViewInit {

  public params: any;
  public editingStatus: boolean = false;
  public editingSeasonStatus: boolean = false;
  public gridSubscription$: Subscription

  constructor(
    private ratesService: RatesService
  ) {}

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.gridSubscription$ = this.ratesService.getGridChangedSubject().subscribe((changedGrid: any) => {
      if(changedGrid && changedGrid.type === 'sipp' && this.params?.data?.sipp === changedGrid.data.sipp) {
        this.editingStatus = changedGrid.rowEditing;
      }
      if(changedGrid && changedGrid.type === 'extras' && this.params?.data?.code === changedGrid.data.code) {
        this.editingStatus = changedGrid.rowEditing;
      }
      if(changedGrid && changedGrid.type === 'season') {
        this.editingSeasonStatus = changedGrid.rowEditing;
      }
    })
    this.editingSeasonStatus = JSON.parse(localStorage.getItem('seasonEditing')).status;
  }

  getValue() {
    // throw new Error('Method not implemented.');
  }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }

  btnTrashClickedHandler() {
    // this.params.clicked(this.params.data);
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
