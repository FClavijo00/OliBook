import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlotDetailPage } from './plot-detail.page';

describe('PlotDetailPage', () => {
  let component: PlotDetailPage;
  let fixture: ComponentFixture<PlotDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
