import { DateCellEditorComponent } from "app/shared/components/editable-grid/date-cell-editor/date-cell-editor.component";
import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { PromoButtonGroupComponent } from "app/shared/components/editable-grid/promo-button-group/promo-button-group.component";
import { Inject } from "@angular/core";
import { RatesService } from "app/shared/services/rates/rates.service";

export class PromoGridDecorator extends GridDecoratorBase {

  countryOptions: any[] = [];
  brokerOptions: any[] = [];
  vehicleCategoryOptions: any[] = [];

  editingRow: boolean
  constructor(optionsObject : any= {}, private ratesService: RatesService) {
    super();
    this.countryOptions = optionsObject?.country || [];
    this.brokerOptions = optionsObject?.broker || [];
    this.vehicleCategoryOptions = optionsObject?.vehicleCategory || [];
  }

  buildGrid(grid: GridBase) {
    grid.frameworkComponents = {
      dateCell: DateCellEditorComponent,
      numberCell: NumberCellEditorComponent,
    };

    grid.onCellClicked = (e) => {

    }

    grid.onRowEditingStarted = (e: any) => {
      this.editingRow = true;
      localStorage.setItem('promoEditing', JSON.stringify({status: true}));
      this.ratesService.sendGridChangedSubject({ type: 'promo', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
    }

    grid.onRowEditingStopped = (e: any) => {
      this.editingRow = false;
      localStorage.setItem('promoEditing', JSON.stringify({status: true}));
      this.ratesService.sendGridChangedSubject({ type: 'promo', rowEditing: false, rowIndex: e.rowIndex, data: e.data });
      // this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
    }

    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
