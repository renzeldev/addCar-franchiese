import { Component, OnInit, EventEmitter } from '@angular/core';
import { ExtraSeasonDecorator } from '../rates-general/grid-decorators/extra-season-decorator';
import { ExtraSeasonModel } from 'app/shared/models/rates/extra-season-model';

@Component({
  selector: 'app-rates-seasons-list',
  templateUrl: './rates-seasons-list.component.html',
  styleUrls: ['./rates-seasons-list.component.css']
})
export class RatesSeasonsListComponent implements OnInit {

  rowData: any[] = null;
  newExtraSeasonEmitter: EventEmitter<any> = new EventEmitter();
  newExtraSeasonRowPrototype = new ExtraSeasonModel();
  extraSeasonDecorator = new ExtraSeasonDecorator();
  constructor() { }

  ngOnInit(): void {
  }

  insertExtraSeason() {
    this.newExtraSeasonEmitter.emit('new');
  }

}
