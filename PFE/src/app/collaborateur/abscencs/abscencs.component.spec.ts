import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbscencsComponent } from './abscencs.component';

describe('AbscencsComponent', () => {
  let component: AbscencsComponent;
  let fixture: ComponentFixture<AbscencsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbscencsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbscencsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
