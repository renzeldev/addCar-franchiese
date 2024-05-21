import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryExportExcelComponent } from './country-export-excel.component';

describe('CountryExportExcelComponent', () => {
  let component: CountryExportExcelComponent;
  let fixture: ComponentFixture<CountryExportExcelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryExportExcelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryExportExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
