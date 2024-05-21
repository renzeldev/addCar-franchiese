import { Component, EventEmitter, OnInit } from '@angular/core';
import { ExtraValueModel } from 'app/shared/models/rates/extra-value.model';
import { ExtraValueDecorator } from '../rates-general/grid-decorators/extra-value-decorator';

@Component({
  selector: 'app-rates-values-list',
  templateUrl: './rates-values-list.component.html',
  styleUrls: ['./rates-values-list.component.css']
})
export class RatesValuesListComponent implements OnInit {

  rowData: any[] = null;
  extraValueDecorator = new ExtraValueDecorator();
  newExtraValueEmitter: EventEmitter<any> = new EventEmitter();
  newExtraValueRowPrototype = new ExtraValueModel();
  constructor() { }

  ngOnInit(): void {
  }

  insertExtraValue() {

  }

}
