import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {

  constructor(private renderer: Renderer2, private dialogRef: MatDialogRef<ConfirmationModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  // discardChanges() {
  //   this.dialogRef.close({ result: -1 });
  // }

  confirm() {
    this.dialogRef.close({ result: 1 });
  }

  cancel() {
    this.dialogRef.close({ result: 0 });
  }

}
