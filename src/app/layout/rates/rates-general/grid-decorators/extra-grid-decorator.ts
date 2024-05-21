import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
// import { RatesService } from "app/shared/services/rates/rates.service";
export class ExtraGridDecorator extends GridDecoratorBase {

  editingRow: boolean = false;
  constructor(private rateService) {
    super();
  }

  buildGrid(grid: GridBase) {

    grid.frameworkComponents = {
      numberCell: NumberCellEditorComponent,
    };

    grid.onRowSelected = async (e) => {

    }

    grid.onCellKeyDown = async (e) => {
      if (e.event.key === "Enter") {
        if(e.colDef.field === "code") {
          let updateExtraData = {
            uid: e.data.uid,
            entityVersion: e.data.entityVersion,
            code: e.data.code
          }
          this.rateService.updateRateSeasonExtra(e.data.uid, updateExtraData).subscribe();
        } else if (e.colDef.field === "maxValues") {

        } else {
          let vehicle = e.colDef.field;
          let uid = e.data[vehicle + "_uid"];
          
          this.rateService.getRateSeasonExtraValue(uid).subscribe((data: any) => {
            let updatedData = { ...data, value: e.value };
            this.rateService.updateRateSeasonExtraValue(uid, updatedData).subscribe();
          });
        }
      }
    }

    grid.onRowEditingStarted = (e: any) => {
      this.editingRow = true;
      this.rateService.sendGridChangedSubject({ type: 'extra', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
    }

    grid.onRowEditingStopped = (e: any) => {
      this.editingRow = false;
      this.rateService.sendGridChangedSubject({ type: 'extra', rowEditing: false, rowIndex: e.rowIndex, data: e.data });
      // this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
    }

    // grid.onRowValueChanged = (e) => {
    //   this.rateService.sendGridChangedSubject("extra");
    // }

    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
