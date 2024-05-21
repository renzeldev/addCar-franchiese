import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { DropdownCellEditorComponent } from "app/shared/components/editable-grid/dropdown-cell-editor/dropdown-cell-editor.component";
import { DateCellEditorComponent } from "app/shared/components/editable-grid/date-cell-editor/date-cell-editor.component";
import { CheckboxCellEditorComponent } from "app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component";

export class FleetGridDecorator extends GridDecoratorBase {

  rateUid: string;
  isNew: boolean = false;
  editingRow: boolean = false;
    constructor(
      private readonly ratesService: any
    ) {
        super();
    }

  buildGrid(grid: GridBase) {

    grid.frameworkComponents = {
      numberCell: NumberCellEditorComponent,
      dateCell: DateCellEditorComponent,
      checkboxCell: CheckboxCellEditorComponent
    };

    grid.onRowEditingStarted = (e: any) => {
      this.editingRow = true;
      localStorage.setItem('allotmentEditing', JSON.stringify({ status: true }));
      this.ratesService.sendGridChangedSubject({ type: 'allotment', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
    }

    grid.onRowEditingStopped = (e: any) => {
      this.editingRow = false;
      localStorage.setItem('allotmentEditing', JSON.stringify({ status: false }));
      this.ratesService.sendGridChangedSubject({ type: 'allotment', rowEditing: false, rowIndex: e.rowIndex, data: e.data });
      // this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
    }

    grid.onRowValueChanged = (e: any) => {
      this.ratesService.sendGridChangedSubject({ type: 'allotment', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
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

    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
