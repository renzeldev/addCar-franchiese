import { Component, AfterViewInit, OnInit, Output, EventEmitter } from '@angular/core';
import { ICellEditorAngularComp, IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
    selector: 'daybreak-add-edit-button',
    templateUrl: './daybreak-add-button.component.html',
    styleUrls: ['./custom-header.component.css']
})
export class DayBreakAddButtonComponent implements ICellEditorAngularComp, AfterViewInit, OnInit {
    isEdit: boolean = false;

    ngAfterViewInit(): void {

    }

    ngOnInit(): void {
    }

    refresh(params: IHeaderParams): boolean {
        return true;
    }

    getValue() {
        // throw new Error('Method not implemented.');
    }

    params: any;

    agInit(params: any): void {
        this.params = params;
        this.isEdit = this.params.isEdit;
    }

    clickEditButton(): void {
        this.isEdit = !this.isEdit;
        this.params.editEventHandler(this.isEdit);
    }
    
    clickAddButton(): void {
        this.params.addEventHandler()
    }

    clickCheckButton(): void {
        this.params.checkEventHandler()
        this.isEdit = false;
        this.params.editEventHandler(this.isEdit);
    }

    clickCloseButton(): void {
        this.isEdit = false;
        this.params.closeEventHandler()
        this.params.editEventHandler(this.isEdit);
    }

    ngOnDestroy(): void {
        // Cleanup code if needed
    }
}