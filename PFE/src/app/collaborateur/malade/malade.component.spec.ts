import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaladeComponent } from './malade.component';

describe('MaladeComponent', () => {
  let component: MaladeComponent;
  let fixture: ComponentFixture<MaladeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaladeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaladeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
