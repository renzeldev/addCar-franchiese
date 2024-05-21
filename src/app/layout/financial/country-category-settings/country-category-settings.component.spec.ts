import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryCategorySettingsComponent } from './country-category-settings.component';

describe('CountryCategorySettingsComponent', () => {
  let component: CountryCategorySettingsComponent;
  let fixture: ComponentFixture<CountryCategorySettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryCategorySettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryCategorySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
