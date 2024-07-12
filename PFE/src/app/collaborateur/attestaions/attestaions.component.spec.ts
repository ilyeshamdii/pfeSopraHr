import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttestaionsComponent } from './attestaions.component';

describe('AttestaionsComponent', () => {
  let component: AttestaionsComponent;
  let fixture: ComponentFixture<AttestaionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttestaionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestaionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
