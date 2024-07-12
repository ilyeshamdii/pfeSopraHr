import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsRhComponent } from './questions-rh.component';

describe('QuestionsRhComponent', () => {
  let component: QuestionsRhComponent;
  let fixture: ComponentFixture<QuestionsRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionsRhComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
