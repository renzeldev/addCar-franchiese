import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { CheckboxCellEditorComponent } from "app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component";
// import { RatesService } from "app/shared/services/rates/rates.service";
export class ExtraPercentDecorator extends GridDecoratorBase {

    constructor() {
        super();
    }

    buildGrid(grid: GridBase) {

        grid.columnDefs = [
            { headerName: "Description", field: 'description', editable: true, minWidth: 800 },
            { headerName: "Days", field: 'days', editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' }, minWidth: 140 },
            { headerName: "Extras", field: 'extras', editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' }, minWidth: 140 },
        ];

        grid.frameworkComponents = {
            numberCell: NumberCellEditorComponent,
        };

        grid.defaultColDef = { resizable: true };
        grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
    }
}
