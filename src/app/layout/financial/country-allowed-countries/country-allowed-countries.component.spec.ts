import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryAllowedCountriesComponent } from './country-allowed-countries.component';

describe('CountryAllowedCountriesComponent', () => {
  let component: CountryAllowedCountriesComponent;
  let fixture: ComponentFixture<CountryAllowedCountriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryAllowedCountriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryAllowedCountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
