import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeAttestationsComponent } from './demande-attestations.component';

describe('DemandeAttestationsComponent', () => {
  let component: DemandeAttestationsComponent;
  let fixture: ComponentFixture<DemandeAttestationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DemandeAttestationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandeAttestationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
