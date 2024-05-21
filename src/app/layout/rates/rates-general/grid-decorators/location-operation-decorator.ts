import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { HeaderCellEditorComponent } from "app/shared/components/editable-grid/header-cell-editor/header-cell-editor.component";
import { CheckboxCellEditorComponent } from "app/shared/components/editable-grid/checkbox-cell-editor/checkbox-cell-editor.component";

export class LocationOperatorGridDecorator extends GridDecoratorBase {

  constructor() {
    super();
  }

  buildGrid(grid: GridBase) {

    grid.columnDefs = [
        { field: 'extra', headerName:"Extras", editable: false, width: 800 },
        { field: 'mandatory', headerName: "Mandatory", editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } },
        { field: 'available', headerName: "Not Available", editable: true, cellEditor: CheckboxCellEditorComponent, valueFormatter: (params) => { if (params.value == true) return 'Yes'; else return 'No' } }
    ]

    grid.frameworkComponents = {
      numberCell: NumberCellEditorComponent,
      headerCell: HeaderCellEditorComponent
    };

    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
