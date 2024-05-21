import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-allotment-day-item',
  templateUrl: './allotment-day-item.component.html',
  styleUrls: ['./allotment-day-item.component.css']
})
export class AllotmentDayItemComponent implements OnInit {

  allotment: number = 0;
  reservation: number = 0;
  percentage: number = 0.00;
  constructor() { }

  ngOnInit(): void {
  }

}
