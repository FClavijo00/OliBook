import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TiposTrabajosPage } from './tipos-trabajos.page';

describe('TiposTrabajosPage', () => {
  let component: TiposTrabajosPage;
  let fixture: ComponentFixture<TiposTrabajosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposTrabajosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
