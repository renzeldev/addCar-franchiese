import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-groups-list-filter',
  templateUrl: './groups-list-filter.component.html',
  styleUrls: ['./groups-list-filter.component.css']
})
export class GroupsListFilterComponent implements OnInit {

  public formGroup: FormGroup;
  @Output()
  onFilter = new EventEmitter();
  
  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  public createForm() {
    this.formGroup = this.formBuilder.group({
      filter: [""],
    });
  }

  filter() {
    this.onFilter.emit(this.formGroup.value.filter);
  }

}
