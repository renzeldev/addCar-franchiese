import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { NotificationService } from 'app/shared/services/notification.service';
import { RatesService } from 'app/shared/services/rates/rates.service';

@Component({
  selector: 'app-edit-remove-button-group',
  templateUrl: './edit-remove-button-group.component.html',
  styleUrls: ['./edit-remove-button-group.component.css']
})
export class EditRemoveButtonGroupComponent implements ICellEditorAngularComp, AfterViewInit, OnInit {

  public params: any;
  public editingStatus: boolean = false;

  constructor(
    private ratesService: RatesService,
    private notifr: NotificationService,
  ) { }

  ngOnInit() {
    this.ratesService.getGridChangedSubject().subscribe((changedGrid) => {
      if (changedGrid && changedGrid.type === 'allotment' && this.params.data.uid === changedGrid.data.uid) {
        this.editingStatus = changedGrid.rowEditing;
      }
    });
  }

  ngAfterViewInit(): void {
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
    this.ratesService.sendCancelRateSeasonSubject(this.params)
  }
}
