import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { DeleteEditButtonGroupComponent } from "app/shared/components/editable-grid/delete-edit-button-group/delete-edit-button-group.component";
import { EditButtonCellComponent } from "app/shared/components/editable-grid/edit-button-cell/edit-button-cell.component";
import { CheckboxCellEditorComponent } from "app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component";
// import { RatesService } from "app/shared/services/rates/rates.service";
export class ExtraDefinitionDecorator extends GridDecoratorBase {

    constructor() {
        super();
    }

    buildGrid(grid: GridBase) {

        grid.columnDefs = [
            { headerName: "Value Change", field: 'valueChange', editable: true, width: 80, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
            { headerName: "Included", field: 'included', editable: true, width: 150, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
            { headerName: "Mandatory", field: 'mandatory', editable: true, width: 140, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
            { headerName: "Invoice/Voucher", field: 'invoice', editable: true, width: 140, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
            { headerName: "Breakdown", field: 'breakdown', editable: true, minWidth: 200, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
            { headerName: "Not Available", field: 'available', editable: true, minWidth: 200, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
            { headerName: "Accepted by Default", field:'accepted', editable: true, width: 120, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
            { headerName: "Actions", field:'extraDetail', cellRenderer: EditButtonCellComponent, width: 120 },
        ];

        grid.frameworkComponents = {
            numberCell: NumberCellEditorComponent,
        };

        grid.defaultColDef = { resizable: true };
        grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
    }
}
