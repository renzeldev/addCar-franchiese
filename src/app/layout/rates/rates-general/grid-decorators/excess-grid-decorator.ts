import { GridBase } from 'app/shared/components/editable-grid/grid-base';
import { GridDecoratorBase } from 'app/shared/components/editable-grid/grid-decorator-base';
import { NumberCellEditorComponent } from 'app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component';

export class ExcessGridDecorator extends GridDecoratorBase {
  constructor(private rateService) {
    super()
  }
  editingRow: boolean = false;
  buildGrid(grid: GridBase) {

    grid.onRowEditingStarted = (e: any) => {
      this.editingRow = true;
      this.rateService.sendGridChangedSubject({ type: 'excess', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
    }

    grid.onRowEditingStopped = (e: any) => {
      this.editingRow = false;
      this.rateService.sendGridChangedSubject({ type: 'excess', rowEditing: false, rowIndex: e.rowIndex, data: e.data });
      // this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
    }

    grid.frameworkComponents = {
      numberCell: NumberCellEditorComponent,
    }
    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl+ Shift+C", func: grid.clone });
  }
}
