import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SippButtonGroupComponent } from './sipp-button-group.component';

describe('SippButtonGroupComponent', () => {
  let component: SippButtonGroupComponent;
  let fixture: ComponentFixture<SippButtonGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SippButtonGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SippButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
