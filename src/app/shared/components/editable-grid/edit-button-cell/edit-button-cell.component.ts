import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { RatesService } from 'app/shared/services/rates/rates.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-button-cell',
  templateUrl: './edit-button-cell.component.html',
  styleUrls: ['./edit-button-cell.component.css']
})
export class EditButtonCellComponent implements ICellRendererAngularComp {

  private params: any;
  public isEdit: boolean = false;
  public editingStatus: boolean = false;
  public editingSeasonStatus: boolean = false;
  public gridSubscription$: Subscription

  constructor(
    private ratesService: RatesService
  ) {}
  refresh(params: ICellRendererParams): boolean {
    // throw new Error('Method not implemented.');
    return true;
  }

  ngOnInit(): void {
    this.editingSeasonStatus = JSON.parse(localStorage.getItem('seasonEditing')).status;
    this.gridSubscription$ = this.ratesService.getGridChangedSubject().subscribe((changedGrid: any) => {
      if(changedGrid && changedGrid.type === 'season') {
        this.editingSeasonStatus = changedGrid.rowEditing;
      }
    })
  }

  agInit(params: any): void {
    this.params = params;
  }

  btnClickedHandler() {
    this.params.clickEdit(this.params);
    this.isEdit = true;
  }

  btnCheckClickedHandler() {
    this.isEdit = false;
    this.params.clickCheck(this.params);
  }

  btnCloseClickedHandler() {
    this.isEdit = false;
    this.params.clickClose(this.params);
  }

}
