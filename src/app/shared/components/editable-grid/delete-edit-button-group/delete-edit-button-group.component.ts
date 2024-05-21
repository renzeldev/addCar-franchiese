import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-delete-edit-button-group',
  templateUrl: './delete-edit-button-group.component.html',
  styleUrls: ['./delete-edit-button-group.component.css']
})
export class DeleteEditButtonGroupComponent implements ICellRendererAngularComp {

  editingStatus: boolean
  private params: any;

  constructor() {}
  refresh(params: ICellRendererParams): boolean {
    // throw new Error('Method not implemented.');
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

}
