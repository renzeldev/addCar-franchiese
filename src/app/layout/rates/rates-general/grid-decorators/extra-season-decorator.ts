import { NumberCellEditorComponent } from "app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component";
import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { DeleteEditButtonGroupComponent } from "app/shared/components/editable-grid/delete-edit-button-group/delete-edit-button-group.component";
// import { RatesService } from "app/shared/services/rates/rates.service";
export class ExtraSeasonDecorator extends GridDecoratorBase {

    constructor() {
        super();
    }

    buildGrid(grid: GridBase) {

        grid.columnDefs = [
            { headerName: "Code", field: 'code', editable: true, minWidth: 150 },
            { headerName: "Description", field: 'description', editable: true, minWidth: 150 },
            { headerName: "Start Date", field: 'startDate', editable: true, minWidth: 140 },
            { headerName: "End Date", field: 'endDate', editable: true, minWidth: 140 },
            { headerName: "Reservation from", field: 'reservationFrom', editable: true, minWidth: 140 },
            { headerName: "Reservation to", field: 'reservationTo', editable: true, minWidth: 140 },
            { headerName: "Action", field:'extraSeason', cellRenderer: DeleteEditButtonGroupComponent, width: 120 },
        ];

        grid.frameworkComponents = {
            numberCell: NumberCellEditorComponent,
        };

        grid.defaultColDef = { resizable: true };
        grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
    }
}
