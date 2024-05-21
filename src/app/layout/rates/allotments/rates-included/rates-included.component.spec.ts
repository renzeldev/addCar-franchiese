import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatesIncludedComponent } from './rates-included.component';

describe('RatesIncludedComponent', () => {
  let component: RatesIncludedComponent;
  let fixture: ComponentFixture<RatesIncludedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatesIncludedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesIncludedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
