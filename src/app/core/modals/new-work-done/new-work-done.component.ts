import { Component, inject, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
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

@Component({
  selector: 'app-new-work-done',
  templateUrl: './new-work-done.component.html',
  styleUrls: ['./new-work-done.component.scss'],
  imports: [IonicModule, ReactiveFormsModule, LoadingComponent],
})
export class NewWorkDoneComponent implements OnInit {
  @Input() modo: 'add' | 'edit' = 'add';
  @Input() workDone: any;

  public title = 'Registrar Trabajo Realizado';

  public loading: boolean = false;
  public tipoLoading: 'add' | 'edit' | '' = '';

  public plots: any[] = [];
  public workTypes: WorkTypes[] = [];
  public trabajadores: any[] = [];

  public user: User | null = null;

  public newWorkDoneForm: FormGroup = inject(FormBuilder).group({
    plotSelected: ['', Validators.required],
    workSelected: ['', Validators.required],
    dateWorkDone: [new Date().toISOString(), Validators.required],
    description: [''],
    trabajadoresSelected: [''],
  });

  private _uiService = inject(UIService);
  private _plotsService = inject(PlotsService);
  private _workService = inject(WorksService);
  private _modalCtrl = inject(ModalController);
  private _toastCtrl = inject(ToastController);
  private _usersService = inject(UsersService);

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
      const response = await firstValueFrom(this._workService.obtenerTipos(this.user.id));
      this.workTypes = response || [];
    } catch (error) {
      console.error('Error en la petición a la API:', error);
    } finally {
    }
  }

  async cargarParcelas() {
    if (this.user)
    try {
      const response = await firstValueFrom(this._plotsService.obtenerParcelas(this.user.id, this.user.empresa_id));
      this.plots = response.misParcelas || [];
    } catch (error) {
      console.error('Error en la petición a la API:', error);
    } finally {
    }
  }

  async cargarTrabajadores() {
    if (this.user && this.user.empresa_id)
    try {
      const response = await firstValueFrom(this._usersService.obtenerTrabajadores(this.user.empresa_id));
      this.trabajadores = response || [];
    } catch (error) {
      console.error('Error en la petición a la API:', error);
    } finally {
    }
  }

  /** GETTERS FORM */
  get plotSelectedControl() {
    return this.newWorkDoneForm.get('plotSelected');
  }

  get workSelectedControl() {
    return this.newWorkDoneForm.get('workSelected');
  }

  get dateWorkDoneControl() {
    return this.newWorkDoneForm.get('dateWorkDone');
  }

  get descriptionControl() {
    return this.newWorkDoneForm.get('description');
  }

  get trabajadoresSelectedControl() {
    return this.newWorkDoneForm.get('trabajadoresSelected');
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
          console.log(this.newWorkDoneForm.value);
          break;
          this.loading = true;
          const workDone: WorkDone = {
            id: 0,
            plot_id: this.newWorkDoneForm.value.plotSelected,
            work_type: this.newWorkDoneForm.value.workSelected,
            date: this.newWorkDoneForm.value.dateWorkDone.split('T')[0],
            description: this.newWorkDoneForm.value.description,
          };
          if (this.user?.rol === 'EMPRESA') {
            workDone.trabajadores = this.newWorkDoneForm.value.trabajadoresSelected;
          }
          this._workService.addWorkDone(workDone).subscribe((response) => {
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
          console.log(this.newWorkDoneForm.value);
          break;
          this.loading = true;
          const workDone: WorkDone = {
            id: this.workDone.id,
            plot_id: this.workDone.plot_id,
            work_type: this.newWorkDoneForm.value.workSelected,
            date: this.newWorkDoneForm.value.dateWorkDone.split('T')[0],
            description: this.newWorkDoneForm.value.description,
          };
          if (this.user?.rol === 'EMPRESA') {
            workDone.trabajadores = this.newWorkDoneForm.value.trabajadoresSelected;
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
        this.newWorkDoneForm.reset();
        if (this.user?.rol === 'EMPRESA')
        this.newWorkDoneForm.controls['trabajadoresSelected'].addValidators(Validators.required)
        break;
      case 'edit':
        this.title = 'Editar Trabajo Realizado';
        console.log(this.workDone);
        if (this.user?.rol === 'EMPRESA')
        this.newWorkDoneForm.controls['trabajadoresSelected'].addValidators(Validators.required)
        this.newWorkDoneForm.patchValue({
          plotSelected: this.workDone.parcela_id,
          workSelected: this.workDone.tipo_trabajo_id,
          dateWorkDone: this.workDone.fecha_trabajo,
          description: this.workDone.observaciones,
          trabajadoresSelected: this.workDone.trabajadores.map((trabajador: { id: number; }) => trabajador.id),
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
