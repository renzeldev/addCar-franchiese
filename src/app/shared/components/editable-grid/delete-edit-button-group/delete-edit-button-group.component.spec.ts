import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEditButtonGroupComponent } from './delete-edit-button-group.component';

describe('DeleteEditButtonGroupComponent', () => {
  let component: DeleteEditButtonGroupComponent;
  let fixture: ComponentFixture<DeleteEditButtonGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteEditButtonGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteEditButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
