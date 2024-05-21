import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { DropdownCellEditorComponent } from "app/shared/components/editable-grid/dropdown-cell-editor/dropdown-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { HeaderCellEditorComponent } from "app/shared/components/editable-grid/header-cell-editor/header-cell-editor.component";

export class BrokerGridDecorator extends GridDecoratorBase {

  dropdownOptions: any[] = [];
  constructor() {
    super();
  }

  buildGrid(grid: GridBase) {

    grid.frameworkComponents = {
      numberCell: NumberCellEditorComponent,
      headerCell: HeaderCellEditorComponent
    };

    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
