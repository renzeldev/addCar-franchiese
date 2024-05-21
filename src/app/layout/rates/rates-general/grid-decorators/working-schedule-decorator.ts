import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { TimeCellEditorComponent } from "app/shared/components/editable-grid/time-cell-editor/time-cell-editor.component";

export class WorkingScheduleGridDecorator extends GridDecoratorBase {

  constructor() {
    super();
  }

  buildGrid(grid: GridBase) {

    grid.columnDefs = [
        { field: 'extra', headerName:"Extras", editable: false },
        { field: 'monday', headerName: "Monday", editable: true, cellEditor: TimeCellEditorComponent, valueFormatter: (params) => { console.log(params) }},
        { field: 'tuesday', headerName: "Tuesday", editable: true, cellEditor: TimeCellEditorComponent },
        { field: 'wednesday', headerName: "Wednesday", editable: true, cellEditor: TimeCellEditorComponent },
        { field: 'thursday', headerName: "Thursday", editable: true, cellEditor: TimeCellEditorComponent },
        { field: 'friday', headerName: "Friday", editable: true, cellEditor: TimeCellEditorComponent },
        { field: 'saturday', headerName: "Saturday", editable: true, cellEditor: TimeCellEditorComponent },
        { field: 'sunday', headerName: "Sunday", editable: true, cellEditor: TimeCellEditorComponent },
    ]

    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
