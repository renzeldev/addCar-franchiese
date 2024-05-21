import { ColDef, ColGroupDef } from 'ag-grid-community';
import { DateCellEditorComponent } from 'app/shared/components/editable-grid/date-cell-editor/date-cell-editor.component';
import { DropdownCellEditorComponent } from 'app/shared/components/editable-grid/dropdown-cell-editor/dropdown-cell-editor.component';
import { NumberCellEditorComponent } from 'app/shared/components/editable-grid/number-cell-editor/number-cell-editor.component';
import { PromoButtonGroupComponent } from 'app/shared/components/editable-grid/promo-button-group/promo-button-group.component';
import { SippButtonGroupComponent } from 'app/shared/components/editable-grid/sipp-button-group/sipp-button-group.component';

export class PromoColumnDefs {
    columnDefs: (ColDef | ColGroupDef)[] = [
        {
            groupId:'countryGroup',
            children:[
                { field: 'country', editable: true, cellEditor: DropdownCellEditorComponent, width:160  },
                { field: 'broker', editable: true, cellEditor: DropdownCellEditorComponent, width:140  },
                { field: 'vehicleCategory', headerName:"Sipp Code", editable: true, cellEditor: DropdownCellEditorComponent, width:120  },
            ]
        },
        {
            headerName: "Pick Up Period",
            groupId:'pickUpPeriod',
            children:[
                { headerName:'Start', field: 'pickupStart', editable: true, cellEditor: DateCellEditorComponent, width: 110 },
                { headerName:'End', field: 'pickupEnd', editable: true, cellEditor: DateCellEditorComponent, width: 110 },
            ]
        },
        {
            headerName: "Booking Period",
            groupId:'bookingPeriod',
            children:[
                { headerName:'Start', field:'bookingStart', editable: true, cellEditor: DateCellEditorComponent, width: 110 },
                { headerName:'End', field: 'bookingEnd', editable: true, cellEditor: DateCellEditorComponent, width: 110 },
            ]
        },
        {
            headerName: "Blackout Period",
            groupId:'blackoutPeriod',
            children:[
                { headerName:'Start', field:'blackoutStart', editable: true, cellEditor: DateCellEditorComponent, width: 110 },
                { headerName:'End', field: 'blackoutEnd', editable: true, cellEditor: DateCellEditorComponent, width: 110 },
            ]
        },
        { field: 'discount', editable: true, cellEditor: NumberCellEditorComponent, valueFormatter: (params) => {return Number(params.value).toFixed(2) + "%"; }, width: 110 },
        { headerName:"Action", field:'promo', cellRenderer: PromoButtonGroupComponent, cellRendererParams: { clicked: (field: any) => { }}, width: 120 }
    ];
}