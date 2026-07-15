import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlotsPage } from './plots.page';

describe('PlotsPage', () => {
  let component: PlotsPage;
  let fixture: ComponentFixture<PlotsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
