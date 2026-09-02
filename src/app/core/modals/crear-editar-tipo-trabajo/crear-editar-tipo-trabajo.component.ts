import { Component, inject, Input, OnInit } from '@angular/core';
import {
  IonContent,
  IonTitle,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { WorkTypes } from '../../models/works';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { User } from '../../models/user';
import { UsersService } from '../../services/users-service';
import { LoadingComponent } from '../../components/loading/loading.component';
import { UIService } from '../../services/uiservice';
import { ToastService } from '../../services/toast-service';
import { WorksService } from '../../services/works-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crear-editar-tipo-trabajo',
  templateUrl: './crear-editar-tipo-trabajo.component.html',
  styleUrls: ['./crear-editar-tipo-trabajo.component.scss'],
  imports: [
    IonIcon,
    IonButton,
    IonCol,
    IonRow,
    IonGrid,
    IonTextarea,
    IonInput,
    IonItem,
    IonList,
    IonTitle,
    IonContent,
    ReactiveFormsModule,
    LoadingComponent,
  ],
})
export class CrearEditarTipoTrabajoComponent implements OnInit {
  @Input() modo: 'add' | 'edit' = 'add';
  @Input() tipoTrabajo: WorkTypes | null = null;

  private _formBuilder = inject(FormBuilder);
  private _userService = inject(UsersService);
  private _modalCtrl = inject(ModalController);
  private _toastService = inject(ToastService);
  private _worksService = inject(WorksService);
  public _uiService = inject(UIService);

  public loading: boolean = false;
  public tipoLoading: 'add' | 'edit' | '' = '';
  public user: User | null = null;
  public tipoEdicion: any = null;
  public trabajoForm: FormGroup = this._formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  constructor() {}

  cerrarModal() {
    this._modalCtrl.dismiss(null, 'cancel');
  }

  async guardarTipo() {
    if (this.trabajoForm.invalid) {
      this.trabajoForm.markAllAsTouched();
      this._toastService.presentToast(
        'Por favor, completa los campos obligatorios.',
        'toast-error',
        'close-circle-outline',
      );
      return;
    }
    if (this.modo === 'add' && this.user) {
      this._uiService.showLoading();
      try {
        let data = {
          id: 0,
          user_id: this.user.id,
          nombre: this.trabajoForm.get('nombre')?.value,
          descripcion: this.trabajoForm.get('descripcion')?.value,
        };
        const resp = await firstValueFrom(this._worksService.nuevoTipo(data));

        if (resp) {
          this._toastService.presentToast(
            'Tipo de trabajo creado con éxito.',
            'toast-success',
            'checkmark-circle-outline',
          );
          this._uiService.hideLoading();
          this._modalCtrl.dismiss(resp, 'confirm');
        }
      } catch (error) {
        this._toastService.presentToast(
          'Error al guardar el tipo de trabajo.',
          'toast-error',
          'close-circle-outline',
        );
        this._uiService.hideLoading();
        this.cerrarModal();
      }
    }

    if (this.modo === 'edit' && this.user && this.tipoTrabajo) {
      this._uiService.showLoading();
      try {
        let data = {
          id: this.tipoTrabajo.id,
          user_id: this.user.id,
          nombre: this.trabajoForm.get('nombre')?.value,
          descripcion: this.trabajoForm.get('descripcion')?.value,
        };
        const resp = await firstValueFrom(this._worksService.editarTipo(data));

        if (resp) {
          this._toastService.presentToast(
            'Tipo de trabajo editado con éxito.',
            'toast-success',
            'checkmark-circle-outline',
          );
          this._uiService.hideLoading();
          this._modalCtrl.dismiss(resp, 'confirm');
        }
      } catch (error) {
        this._toastService.presentToast(
          'Error al editar el tipo de trabajo.',
          'toast-error',
          'close-circle-outline',
        );
        this._uiService.hideLoading();
        this.cerrarModal();
      }
    }
  }

  ngOnInit() {
    this.user = this._userService.getUser();
    switch (this.modo) {
      case 'add':
        this.trabajoForm.reset();
        break;
      case 'edit':
        this.trabajoForm.patchValue({
          nombre: this.tipoTrabajo?.nombre,
          descripcion: this.tipoTrabajo?.descripcion,
        });
        break;
      default:
        break;
    }
  }
}
