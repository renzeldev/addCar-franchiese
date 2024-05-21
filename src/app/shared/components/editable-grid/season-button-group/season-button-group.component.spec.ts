import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonButtonGroupComponent } from './season-button-group.component';

describe('SeasonButtonGroupComponent', () => {
  let component: SeasonButtonGroupComponent;
  let fixture: ComponentFixture<SeasonButtonGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonButtonGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
