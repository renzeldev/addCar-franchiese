
//import { AutocompleteCell } from "../autocomplete-cell.editor/autocomplete-cell.editor";
import { EventEmitter } from '@angular/core';
import { DateCellEditorComponent } from "app/shared/components/editable-grid/date-cell-editor/date-cell-editor.component";
import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from 'app/shared/components/editable-grid/grid-base';
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { RatesService } from "app/shared/services/rates/rates.service";
import { ActivatedRoute, Route } from "@angular/router";
import { RateSeasonDetailsModel } from "app/shared/models/rates/rates-season-view.model";
import { SeasonButtonGroupComponent } from 'app/shared/components/editable-grid/season-button-group/season-button-group.component';


interface Extra {
  uid: string;
  entityVersion: string;
  seasonUid: string;
  extrasUid: string;
  code: string;
  extraValues: any
}
export class SeasonsGridDecorator extends GridDecoratorBase {

  rateUid: string;
  newSeasonEmitter = new EventEmitter<any>();
  extras: Extra[] = [];
  isNew: boolean = false;
  editingRow: boolean = false;
  constructor(private readonly router: any, private readonly ratesService: any) {
    super();
    this.router.paramMap.subscribe(paramMap => {
      this.rateUid = paramMap['params']['uid'] ?? "";
    })
  }

  deleteSeason(field: any) {
    this.ratesService.deleteRateSeason(field.uid, field.entityVersion).subscribe((res) => {
      this.ratesService.sendRemoveRateSeasonSubject(field.uid);
    });
  }

  buildGrid(grid: GridBase) {
    grid.columnDefs = [
      { headerName: "Season", field: 'description', editable: true, minWidth: 100 },
      { headerName: "Start Date", field: 'startDate', editable: true, cellEditor: DateCellEditorComponent, minWidth: 140 },
      { headerName: "End Date", field: 'endDate', editable: true, cellEditor: DateCellEditorComponent, minWidth: 140 },
      { headerName: "Booking From", field: 'bookingStartDate', editable: true, cellEditor: DateCellEditorComponent, minWidth: 140 },
      { headerName: "Booking To", field: 'bookingEndDate', editable: true, cellEditor: DateCellEditorComponent, minWidth: 140 },
      { headerName: "Min Rate", field: 'rateMin', editable: false, minWidth: 140 },
      { headerName: "Max Rate", field: 'rateMax', editable: false, minWidth: 140 },
      { headerName: "Min Period", field: 'periodMin', editable: true, minWidth: 140 },
      { headerName: "Max Discount %", field: 'discountMax', editable: false, minWidth: 140, valueFormatter: (params) => `${params.value}%` },
      { headerName: "Action", field: 'season', cellRenderer: SeasonButtonGroupComponent, width: 120 },
    ];

    grid.onCellKeyDown = async (e) => {
      let flag = true;
      if (e.event.key === "Enter") {
        // await Object.keys(e.data).forEach(key => {
        //   if (e.data[key] === null || e.data[key] === undefined || e.data[key] === '') {
        //     flag = false;
        //   }
        // })
        // if (flag) {
        //   let newSeason = e.data;
        //   newSeason.bookingStartDate = new Date(e.data.bookingStartDate).toISOString().replace(".000", "");
        //   newSeason.bookingEndDate = new Date(e.data.bookingEndDate).toISOString().replace(".000", "");
        //   if (this.isNew) {
        //     this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
        //   }
        // }
      } else {
        // this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
      }
    }

    grid.onRowEditingStarted = (e: any) => {
      this.editingRow = true;
      localStorage.setItem('seasonEditing', JSON.stringify({ status: true }));
      this.ratesService.sendGridChangedSubject({ type: 'season', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
    }

    grid.onRowEditingStopped = (e: any) => {
      this.editingRow = false;
      localStorage.setItem('seasonEditing', JSON.stringify({ status: false }));
      this.ratesService.sendGridChangedSubject({ type: 'season', rowEditing: false, rowIndex: e.rowIndex, data: e.data });
      // this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
    }

    grid.onRowValueChanged = (e: any) => {
      this.ratesService.sendGridChangedSubject({ type: 'season', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
    }

    grid.onCellClicked = (e: any) => {
      if (!this.editingRow) {
        if (e.colDef.headerName !== "Action") {
          if (e.data.uid === null || e.data.uid === undefined || e.data.uid === '') {
            this.isNew = true;
          }
        } else {
          this.editingRow = true;
        }
      }
    }

    grid.onSelectionChanged = (e: any) => {
      if (!this.editingRow) {
        if (!this.isNew) {
          let data = e.api.getSelectedRows();
          this.ratesService.sendSeasonGridSubject(data[0]);
          this.ratesService.sendRateSeasonExcessSubject(data[0].uid);
          this.ratesService.sendRateExtrasSubject(data[0].uid);
          this.ratesService.sendRateSeasonValuesSubject(data[0].uid);
        }
      }
    }

    // grid.onRowValueChanged = (e) => {
    //   if (e.data.uid) {
    //     this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, uid: e.data.uid, rowIndex: e.rowIndex });
    //   }
    // }

    grid.frameworkComponents = {
      dateCell: DateCellEditorComponent,
      numberCell: NumberCellEditorComponent
    };

    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
