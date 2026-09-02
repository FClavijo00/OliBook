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
  ModalController,
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
  hammerOutline,
} from 'ionicons/icons';
import { WorkTypes } from 'src/app/core/models/works';
import { ToastService } from 'src/app/core/services/toast-service';
import { CrearEditarTipoTrabajoComponent } from 'src/app/core/modals/crear-editar-tipo-trabajo/crear-editar-tipo-trabajo.component';

@Component({
  selector: 'app-tipos-trabajos',
  templateUrl: './tipos-trabajos.page.html',
  styleUrls: ['./tipos-trabajos.page.scss'],
  standalone: true,
  imports: [
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
    ReactiveFormsModule
],
})
export class TiposTrabajosPage implements OnInit {
  public _uiService = inject(UIService);
  private _worksService = inject(WorksService);
  private _fb = inject(FormBuilder);
  private _userService = inject(UsersService);
  private _toastService = inject(ToastService);
  private _modalCtrl = inject(ModalController);

  user: User | null = null;

  tipoEdicion: WorkTypes | null = null;
  trabajoForm!: FormGroup;
  isModalOpen: boolean = false;

  tiposTrabajos: any[] = [];

  constructor() {
    addIcons({
      addCircle,
      hammerOutline,
      createOutline,
      checkmarkCircle,
      closeCircle,
      constructOutline,
      closeOutline,
      checkmarkOutline,
      closeCircleOutline,
      checkmarkCircleOutline
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

  async abrirModalCrear() {
    const modal = await this._modalCtrl.create({
      component: CrearEditarTipoTrabajoComponent,
      initialBreakpoint: 1, // For a "Sheet Modal"
      breakpoints: [0, 0.5, 0.75, 1],
      handle: true,
      mode: 'md',
      componentProps: { modo: 'add' },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.obtenerTiposAccion('inicio');
    }
  }

  async abrirModalEditar(tipo: any) {
    const modal = await this._modalCtrl.create({
      component: CrearEditarTipoTrabajoComponent,
      initialBreakpoint: 1, // For a "Sheet Modal"
      breakpoints: [0, 0.5, 0.75, 1],
      handle: true,
      mode: 'md',
      componentProps: { modo: 'edit', tipoTrabajo: tipo },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.obtenerTiposAccion('inicio');
    }
  }

  initForm() {
    this.trabajoForm = this._fb.group({
      nombre: ['', Validators.required, Validators.minLength(3)],
      descripcion: [''],
    });
  }

  ngOnInit() {
    this.user = this._userService.getUser();
    this.obtenerTiposAccion('inicio');
    this.initForm();
  }
}
