import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-time-cell-editor',
  templateUrl: './time-cell-editor.component.html',
  styleUrls: ['./time-cell-editor.component.css']
})
export class TimeCellEditorComponent implements ICellEditorAngularComp, AfterViewInit {

  params: any;
  value: any;
  highlightAllOnFocus: any;
  @ViewChild('input', { read: ViewContainerRef }) public input: any;
  
  constructor() { }

  agInit(params: any): void {
    this.params = params;
    this.value = this.params.value;
    console.log(this.value);
  }

  getValue() {
    return this.input.element.nativeElement.value;
  }

  ngAfterViewInit() {
  
  }

}
