import { Component, OnInit, EventEmitter } from '@angular/core';
import { ExtraDefinitionDecorator } from '../rates-general/grid-decorators/extra-definition-decorator';
import { ExtraDefinitionModel } from 'app/shared/models/rates/extra-definition-model';

@Component({
  selector: 'app-rates-extras-definitions-list',
  templateUrl: './rates-extras-definitions-list.component.html',
  styleUrls: ['./rates-extras-definitions-list.component.css']
})
export class RatesExtrasDefinitionsListComponent implements OnInit {

  newExtraDefinitionEmitter : EventEmitter<any> = new EventEmitter();
  newExtraDefinitionRowPrototype = new ExtraDefinitionModel()
  rowData: any[] = null;
  extraDetailDecorator = new ExtraDefinitionDecorator();
  constructor() { }

  ngOnInit(): void {
  }

}
