import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { DropdownCellEditorComponent } from "app/shared/components/editable-grid/dropdown-cell-editor/dropdown-cell-editor.component";
import { DateCellEditorComponent } from "app/shared/components/editable-grid/date-cell-editor/date-cell-editor.component";
import { CheckboxCellEditorComponent } from "app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component";
import { EditRemoveButtonGroupComponent } from "app/shared/components/editable-grid/edit-remove-button-group/edit-remove-button-group.component";

export class OnewayGridDecorator extends GridDecoratorBase {

    public firstStationGroups: any[] = [];
    public secondStationGroups: any[] = [];
    constructor() {
        super();
        // this.firstStationGroups = firstStationGroups;
        // this.secondStationGroups = secondStationGroups;
    }

  buildGrid(grid: GridBase) {
    grid.columnDefs = [
        { field: 'locationInUid', headerName:"Station1(A)", editable: true, cellEditor: DropdownCellEditorComponent, cellEditorParams: {options: this.firstStationGroups} },
        { field: 'locationOutUid', headerName:"Station2(B)", editable: true, cellEditor: DropdownCellEditorComponent, cellEditorParams: {options: this.secondStationGroups} },
        { field: 'isEnabled', editable: true, cellEditor: CheckboxCellEditorComponent, width: 130 },
        { field: 'extra', editable: true, width: 130 },
        { field: 'cost', headerName:"Value (A)->(B) / (B)->(A)", editable: true, cellEditor: NumberCellEditorComponent, valueFormatter: (params) => {return Number(params.value).toFixed(2)}},
        { field: 'actions', cellRenderer: EditRemoveButtonGroupComponent, width: 120 },
    ];

    grid.frameworkComponents = {
      numberCell: NumberCellEditorComponent,
      dropdownCell: DropdownCellEditorComponent,
      dateCell: DateCellEditorComponent,
      checkboxCell: CheckboxCellEditorComponent
    };

    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
