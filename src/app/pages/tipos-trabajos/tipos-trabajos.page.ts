import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  RefresherCustomEvent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonTextarea,
} from '@ionic/angular/standalone';
import { LoadingComponent } from 'src/app/core/components/loading/loading.component';
import { UIService } from 'src/app/core/services/uiservice';
import { WorksService } from 'src/app/core/services/works-service';
import { User } from 'src/app/core/models/user';
import { UsersService } from 'src/app/core/services/users-service';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  constructOutline,
  createOutline,
  closeOutline,
  checkmarkOutline,
  addCircle,
  checkmarkCircle,
  closeCircle,
  closeCircleOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { WorkTypes } from 'src/app/core/models/works';
import { ToastService } from 'src/app/core/services/toast-service';

@Component({
  selector: 'app-tipos-trabajos',
  templateUrl: './tipos-trabajos.page.html',
  styleUrls: ['./tipos-trabajos.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonRow,
    IonGrid,
    IonModal,
    IonLabel,
    IonItem,
    IonList,
    IonRefresherContent,
    IonRefresher,
    IonIcon,
    IonButton,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    LoadingComponent,
    ReactiveFormsModule,
    IonInput,
    IonTextarea,
  ],
})

export class TiposTrabajosPage implements OnInit {
  public _uiService = inject(UIService);
  private _worksService = inject(WorksService);
  private _fb = inject(FormBuilder);
  private _userService = inject(UsersService);
  private _toastService = inject(ToastService)

  user: User | null = null;

  tipoEdicion: WorkTypes | null = null;
  trabajoForm!: FormGroup;
  isModalOpen: boolean = false;

  tiposTrabajos: any[] = [];

  constructor() {
    addIcons({
      addCircle,
      constructOutline,
      createOutline,
      closeOutline,
      checkmarkOutline,
      checkmarkCircle,
      closeCircle,
      closeCircleOutline,
      checkmarkCircleOutline,
    });
  }

  async obtenerTiposAccion(
    accion: 'inicio' | 'refresh',
    event?: RefresherCustomEvent,
  ) {
    if (accion === 'inicio') {
      this._uiService.showLoading();
    }

    await this.obtenerTipos();

    if (accion === 'refresh' && event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    } else if (accion === 'inicio') {
      setTimeout(() => {
        this._uiService.hideLoading();
      }, 1000);
    }
  }

  private async obtenerTipos() {
    try {
      if (this.user) {
        const response = await firstValueFrom(
          this._worksService.obtenerTipos(this.user.id),
        );
        this.tiposTrabajos = response || [];
      }
    } catch (error) {
      console.error('Error en la petición a la API:', error);
    }
  }

  abrirModalCrear() {
    this.tipoEdicion = null;
    this.trabajoForm = this._fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
    });
    this.isModalOpen = true;
  }

  abrirModalEditar(tipo: any) {
    this.tipoEdicion = tipo;
    this.trabajoForm = this._fb.group({
      nombre: [tipo.nombre, Validators.required],
      descripcion: [tipo.descripcion],
    });
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.tipoEdicion = null;
    this.trabajoForm.reset();
  }

  initForm() {
    this.trabajoForm = this._fb.group({
      nombre: ['', Validators.required, Validators.minLength(3)],
      descripcion: [''],
    });
  }

  guardarTipo() {
    if (this.trabajoForm.invalid) {
      this.trabajoForm.markAllAsTouched();
      this._toastService.presentToast(
        'Por favor, completa los campos obligatorios.',
        'toast-error',
        'close-circle-outline',
      )
      return;
    };

    if (this.tipoEdicion && this.user) {
      let data = {
        id: this.tipoEdicion.id,
        user_id: this.user?.id,
        nombre: this.trabajoForm.get('nombre')?.value,
        descripcion: this.trabajoForm.get('descripcion')?.value,
      }
      this._worksService.editarTipo(data).subscribe(() => {
        this.cerrarModal();
        this._toastService.presentToast(
          'Tipo de trabajo editado con éxito.',
          'toast-success',
          'checkmark-circle-outline',
        );
        this.obtenerTiposAccion('refresh');
      });
    } else if (!this.tipoEdicion && this.user) {
      let data = {
        id: 0,
        user_id: this.user?.id,
        nombre: this.trabajoForm.get('nombre')?.value,
        descripcion: this.trabajoForm.get('descripcion')?.value,
      }
      this._worksService.nuevoTipo(data).subscribe(() => {
        this.cerrarModal();
        this._toastService.presentToast(
          'Tipo de trabajo creado con éxito.',
          'toast-success',
          'checkmark-circle-outline',
        );
        this.obtenerTiposAccion('refresh');
      });
    }
  }

  ngOnInit() {
    this.user = this._userService.getUser();
    this.obtenerTiposAccion('inicio');
    this.initForm();
  }
}
