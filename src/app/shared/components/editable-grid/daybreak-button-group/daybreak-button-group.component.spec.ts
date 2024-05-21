import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaybreakButtonGroupComponent } from './daybreak-button-group.component';

describe('DaybreakButtonGroupComponent', () => {
  let component: DaybreakButtonGroupComponent;
  let fixture: ComponentFixture<DaybreakButtonGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaybreakButtonGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaybreakButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
