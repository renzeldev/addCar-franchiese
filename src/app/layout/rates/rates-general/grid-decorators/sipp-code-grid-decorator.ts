import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { HeaderCellEditorComponent } from "app/shared/components/editable-grid/header-cell-editor/header-cell-editor.component";
import { SelectionChangedEvent } from "ag-grid-community";

export class SippCodeGridDecorator extends GridDecoratorBase {

  dropdownOptions: any[] = [];
  isNew: boolean = false;
  editingRow: boolean = false;
  editDayBreak: string
  selectedRow: any[] = [];
  constructor(options = [], private ratesService) {
    super();
    this.dropdownOptions = options;
    this.ratesService = ratesService;
  }

  buildGrid(grid: GridBase) {

    grid.frameworkComponents = {
      numberCell: NumberCellEditorComponent,
      headerCell: HeaderCellEditorComponent
    };

    grid.onRowEditingStarted = (e: any) => {
      this.editingRow = true;
      // this.ratesService.sendGridChangedSubject({ type: 'sipp', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
    }

    grid.onRowEditingStopped = (e: any) => {
      this.editingRow = false;
      this.ratesService.sendGridChangedSubject({ type: 'sipp', rowEditing: false, rowIndex: e.rowIndex, data: e.data });
      // this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
    }

    grid.onCellKeyDown = (e: any) => {

    }

    grid.onColumnHeaderClicked = (e: any) => {

    }

    grid.onSelectionChanged = (event: SelectionChangedEvent) => {
      var selectedSipp = event.api.getSelectedRows();
      this.ratesService.sendSelectedSippGridSubject({ data: selectedSipp});
    }

    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
