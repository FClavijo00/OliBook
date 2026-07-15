import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorksPage } from './works.page';

describe('WorksPage', () => {
  let component: WorksPage;
  let fixture: ComponentFixture<WorksPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
