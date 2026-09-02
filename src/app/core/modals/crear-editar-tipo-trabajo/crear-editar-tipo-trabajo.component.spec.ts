import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CrearEditarTipoTrabajoComponent } from './crear-editar-tipo-trabajo.component';

describe('CrearEditarTipoTrabajoComponent', () => {
  let component: CrearEditarTipoTrabajoComponent;
  let fixture: ComponentFixture<CrearEditarTipoTrabajoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearEditarTipoTrabajoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearEditarTipoTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
