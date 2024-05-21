import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-checkbox-cell-renderer',
  templateUrl: './checkbox-cell-renderer.component.html',
  styleUrls: ['./checkbox-cell-renderer.component.css']
})
export class CheckboxCellRendererComponent implements OnInit, ICellRendererAngularComp {

  private params: any;
  value: boolean = false;
  constructor() { }

  refresh(params: ICellRendererParams): boolean {
    // throw new Error('Method not implemented.');
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    this.value = this.params.data[this.params.colDef.id + "_highlight"];
  }

  ngOnInit(): void {
  }

  click() {
    this.params.clicked({params: this.params, value: this.value});
  }

}
