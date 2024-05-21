import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { DeleteEditButtonGroupComponent } from "app/shared/components/editable-grid/delete-edit-button-group/delete-edit-button-group.component";
// import { RatesService } from "app/shared/services/rates/rates.service";
export class ExtraValueDecorator extends GridDecoratorBase {

    constructor() {
        super();
    }

    buildGrid(grid: GridBase) {

        grid.columnDefs = [
            { headerName: "Group", field: 'group', editable: true, width: 80 },
            { headerName: "From", field: 'from', editable: true, width: 150 },
            { headerName: "To", field: 'to', editable: true, width: 140 },
            { headerName: "Value", field: 'value', editable: true, width: 140 },
            { headerName: "Minimum value per RA without tax", field: 'minimumValue', editable: true, minWidth: 200 },
            { headerName: "Maximum value per RA without tax", field: 'maximumValue', editable: true, minWidth: 200 },
            { headerName: "Action", field:'extraValues', cellRenderer: DeleteEditButtonGroupComponent, width: 120 },
        ];

        grid.frameworkComponents = {
            numberCell: NumberCellEditorComponent,
        };

        grid.defaultColDef = { resizable: true };
        grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
    }
}
