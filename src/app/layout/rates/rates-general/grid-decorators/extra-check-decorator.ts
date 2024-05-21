import { CheckboxCellEditorComponent } from "app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";

export class ExtraCheckDecorator extends GridDecoratorBase {

    editingRow: boolean = false;
    constructor(private rateService) {
        super();
    }
    buildGrid(grid: GridBase) {

        grid.frameworkComponents = {
            checkboxCell: CheckboxCellEditorComponent,
        };

        grid.onCellClicked = (e) => {

        }

        grid.onRowEditingStarted = (e: any) => {
            this.editingRow = true;
            this.rateService.sendGridChangedSubject({ type: 'extraCheck', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
        }

        grid.onRowEditingStopped = (e: any) => {
            this.editingRow = false;
            this.rateService.sendGridChangedSubject({ type: 'extraCheck', rowEditing: false, rowIndex: e.rowIndex, data: e.data });
            // this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
        }

        grid.defaultColDef = { resizable: true };
        grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
    }
}
