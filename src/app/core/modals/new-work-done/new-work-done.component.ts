import { Component, inject, Input, OnInit } from '@angular/core';
import {
  ModalController,
  ToastController,
  IonContent,
  IonTitle,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonDatetimeButton,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonTextarea,
  IonInput,
  IonDatetime,
} from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingComponent } from '../../components/loading/loading.component';
import { UIService } from '../../services/uiservice';
import { firstValueFrom } from 'rxjs';
import { PlotsService } from '../../services/plots-service';
import { WorksService } from '../../services/works-service';
import { WorkDone, WorkTypes } from '../../models/works';
import { addIcons } from 'ionicons';
import { alertCircle, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { User } from '../../models/user';
import { UsersService } from '../../services/users-service';
import { track } from '@vercel/analytics';

@Component({
  selector: 'app-new-work-done',
  templateUrl: './new-work-done.component.html',
  styleUrls: ['./new-work-done.component.scss'],
  imports: [
    IonIcon,
    IonButton,
    IonCol,
    IonRow,
    IonGrid,
    IonModal,
    IonDatetime,
    IonDatetimeButton,
    IonLabel,
    IonItem,
    IonList,
    IonTitle,
    IonContent,
    ReactiveFormsModule,
    LoadingComponent,
    IonSelect,
    IonSelectOption,
    IonTextarea,
  ],
})
export class NewWorkDoneComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private _uiService = inject(UIService);
  private _plotsService = inject(PlotsService);
  private _workService = inject(WorksService);
  private _modalCtrl = inject(ModalController);
  private _toastCtrl = inject(ToastController);
  private _usersService = inject(UsersService);
  @Input() modo: 'add' | 'edit' = 'add';
  @Input() workDone: any;

  public title = 'Registrar Trabajo Realizado';

  public loading: boolean = false;
  public tipoLoading: 'add' | 'edit' | '' = '';

  public plots: any[] = [];
  public workTypes: WorkTypes[] = [];
  public trabajadores: any[] = [];

  public user: User | null = null;

  public newWorkDoneForm: FormGroup = this._formBuilder.group({
    plotSelected: ['', Validators.required],
    workSelected: ['', Validators.required],
    dateWorkDone: [new Date().toISOString(), Validators.required],
    description: [''],
    trabajadoresSelected: [''],
  });

  constructor() {
    addIcons({
      checkmarkCircle,
      closeCircle,
      alertCircle,
    });
  }

  async cargarTiposTrabajos() {
    if (this.user)
      try {
        const response = await firstValueFrom(
          this._workService.obtenerTipos(this.user.id),
        );
        this.workTypes = response || [];
      } catch (error) {
        console.error('Error en la petición a la API:', error);
      } finally {
      }
  }

  async cargarParcelas() {
    if (this.user)
      try {
        const response = await firstValueFrom(
          this._plotsService.obtenerParcelas(
            this.user.id,
            this.user.empresa_id,
          ),
        );
        this.plots = response.misParcelas || [];
      } catch (error) {
        console.error('Error en la petición a la API:', error);
      } finally {
      }
  }

  async cargarTrabajadores() {
    if (this.user && this.user.empresa_id)
      try {
        const response = await firstValueFrom(
          this._usersService.obtenerTrabajadores(this.user.empresa_id),
        );
        this.trabajadores = response || [];
      } catch (error) {
        console.error('Error en la petición a la API:', error);
      } finally {
      }
  }

  onSubmit() {
    switch (this.modo) {
      case 'add':
        this.tipoLoading = 'add';
        if (this.newWorkDoneForm.invalid) {
          this.newWorkDoneForm.markAllAsTouched();
          const toast = this._toastCtrl.create({
            message: 'Por favor, completa los campos obligatorios.',
            duration: 2000,
            position: 'bottom',
            mode: 'ios',
            icon: 'alert-circle',
            cssClass: 'toast-error',
          });
          toast.then((toast) => {
            toast.present();
          });
          return;
        } else {
          this.loading = true;
          if (this.user) {
            const workDone: WorkDone = {
              id: 0,
              user_id: this.user.id,
              empresa_id:
                this.user.rol === 'EMPRESA' ? this.user.empresa_id : null,
              parcela_id: this.newWorkDoneForm.value.plotSelected,
              tipo_trabajo_id: this.newWorkDoneForm.value.workSelected,
              fecha_trabajo:
                this.newWorkDoneForm.value.dateWorkDone.split('T')[0],
              observaciones: this.newWorkDoneForm.value.description,
            };
            if (this.user?.rol === 'EMPRESA') {
              workDone.trabajadores =
                this.newWorkDoneForm.value.trabajadoresSelected;
            } else {
              workDone.trabajadores = [];
            }

            this._workService.addWorkDone(workDone).subscribe((response) => {
              track('Registro de trabajo realizado', {
                USER: this.user?.name,
              });
              setTimeout(async () => {
                this.loading = false;
                this._toastCtrl.create({
                  message: 'Trabajo realizado registrado con exito',
                  duration: 2000,
                  position: 'bottom',
                  mode: 'ios',
                  icon: 'checkmark-circle',
                  cssClass: 'toast-success',
                });
                this._modalCtrl.dismiss(response, 'confirm');
              }, 2000);
            });
          } else {
            this.loading = false;
            this._toastCtrl.create({
              message: 'No se pudo registrar el trabajo realizado',
              duration: 2000,
              position: 'bottom',
              mode: 'ios',
              icon: 'alert-circle',
              cssClass: 'toast-error',
            });
            this._modalCtrl.dismiss(null, 'cancel');
          }
        }
        break;
      case 'edit':
        this.tipoLoading = 'edit';
        if (this.newWorkDoneForm.invalid) {
          this.newWorkDoneForm.markAllAsTouched();
          const toast = this._toastCtrl.create({
            message: 'Por favor, completa los campos obligatorios.',
            duration: 2000,
            position: 'bottom',
            mode: 'ios',
            icon: 'alert-circle',
            cssClass: 'toast-error',
          });
          toast.then((toast) => {
            toast.present();
          });
          return;
        } else {
          this.loading = true;
          if (this.user) {
            const workDone: WorkDone = {
              id: this.workDone.id,
              user_id: this.user.id,
              empresa_id:
                this.user.rol === 'EMPRESA' ? this.user.empresa_id : null,
              parcela_id: this.workDone.parcela_id,
              tipo_trabajo_id: this.newWorkDoneForm.value.workSelected,
              fecha_trabajo:
                this.newWorkDoneForm.value.dateWorkDone.split('T')[0],
              observaciones: this.newWorkDoneForm.value.description,
            };
            if (this.user?.rol === 'EMPRESA') {
              workDone.trabajadores =
                this.newWorkDoneForm.value.trabajadoresSelected;
            } else {
              workDone.trabajadores = [];
            }
            this._workService.editWorkDone(workDone).subscribe((res) => {
              setTimeout(async () => {
                this.loading = false;
                this._toastCtrl.create({
                  message: 'Trabajo realizado actualizado con exito',
                  duration: 2000,
                  position: 'bottom',
                  mode: 'ios',
                  icon: 'checkmark-circle',
                  cssClass: 'toast-success',
                });
                this._modalCtrl.dismiss(res, 'confirm');
              }, 2000);
            });
          } else {
            this.loading = false;
            this._toastCtrl.create({
              message: 'No se pudo registrar el trabajo realizado',
              duration: 2000,
              position: 'bottom',
              mode: 'ios',
              icon: 'alert-circle',
              cssClass: 'toast-error',
            });
            this._modalCtrl.dismiss(null, 'cancel');
          }
        }
        break;
    }
  }

  closeModal() {
    this._modalCtrl.dismiss(null, 'cancel');
  }

  ngOnInit() {
    this.user = this._usersService.getUser();
    this.loading = false;
    this.tipoLoading = '';
    switch (this.modo) {
      case 'add':
        this.title = 'Registrar Trabajo Realizado';
        if (this.user?.rol === 'EMPRESA')
          this.newWorkDoneForm.controls['trabajadoresSelected'].addValidators(
            Validators.required,
          );
        break;
      case 'edit':
        this.title = 'Editar Trabajo Realizado';
        if (this.user?.rol === 'EMPRESA')
          this.newWorkDoneForm.controls['trabajadoresSelected'].addValidators(
            Validators.required,
          );
        this.newWorkDoneForm.patchValue({
          plotSelected: this.workDone.parcela_id,
          workSelected: this.workDone.tipo_trabajo_id,
          dateWorkDone: this.workDone.fecha_trabajo,
          description: this.workDone.observaciones,
          trabajadoresSelected: this.workDone.trabajadores
            ? this.workDone.trabajadores.map(
                (trabajador: { id: number }) => trabajador.id,
              )
            : [],
        });
        this.newWorkDoneForm.controls['plotSelected'].disable();
        break;
      default:
        this.title = 'Registrar Trabajo Realizado';
        break;
    }
    this.cargarParcelas();
    this.cargarTiposTrabajos();
    if (this.user?.rol === 'EMPRESA') this.cargarTrabajadores();
  }
}
