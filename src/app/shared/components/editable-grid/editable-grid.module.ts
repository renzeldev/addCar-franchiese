import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableGridComponent } from './editable-grid.component';
import { AgGridModule } from 'ag-grid-angular';
import { DateCellEditorComponent } from './date-cell-editor/date-cell-editor.component';
import { DropdownCellEditorComponent } from './dropdown-cell-editor/dropdown-cell-editor.component';
import { FormsModule } from '@angular/forms';
import { CheckboxCellEditorComponent } from './checkbox-cell-editor/checkbox-cell-editor.component';
import { NumberCellEditorComponent } from './number-cell-editor/number-cell-editor.component';
import { HeaderCellEditorComponent } from './header-cell-editor/header-cell-editor.component';
import { EditButtonCellComponent } from './edit-button-cell/edit-button-cell.component';
import { PromoButtonGroupComponent } from './promo-button-group/promo-button-group.component';
import { SeasonButtonGroupComponent } from './season-button-group/season-button-group.component';
import { SippButtonGroupComponent } from './sipp-button-group/sipp-button-group.component';
import { CustomHeaderComponent } from './custom-header/custom-header.component';
import { DayBreakAddButtonComponent } from './custom-header/daybreak-add-button.component';
import { DayBreakAddComponent } from './custom-header/daybreak-add.component';
import { DeleteButtonCellComponent } from './delete-button-cell/delete-button-cell.component';
import { CheckboxCellRendererComponent } from './checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DaybreakButtonGroupComponent } from './daybreak-button-group/daybreak-button-group.component';
import { DeleteEditButtonGroupComponent } from './delete-edit-button-group/delete-edit-button-group.component';
import { TimeCellEditorComponent } from './time-cell-editor/time-cell-editor.component';
import { EditRemoveButtonGroupComponent } from './edit-remove-button-group/edit-remove-button-group.component';

@NgModule({
  declarations: [
    EditableGridComponent,
    DateCellEditorComponent,
    DropdownCellEditorComponent,
    CheckboxCellEditorComponent,
    NumberCellEditorComponent,
    HeaderCellEditorComponent,
    EditButtonCellComponent,
    PromoButtonGroupComponent,
    SeasonButtonGroupComponent,
    SippButtonGroupComponent,
    CustomHeaderComponent,
    DayBreakAddButtonComponent,
    DayBreakAddComponent,
    DeleteButtonCellComponent,
    CheckboxCellRendererComponent,
    DaybreakButtonGroupComponent,
    DeleteEditButtonGroupComponent,
    TimeCellEditorComponent,
    EditRemoveButtonGroupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule.withComponents([DateCellEditorComponent, CustomHeaderComponent, DayBreakAddComponent, DayBreakAddButtonComponent, CheckboxCellRendererComponent])
  ],
  exports: [
    EditableGridComponent
  ]
})
export class EditableGridModule { }
