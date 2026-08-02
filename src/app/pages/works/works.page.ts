import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ModalController,
  AlertController,
  IonHeader,
  IonContent,
  IonToolbar,
  IonButtons,
  IonButton,
  IonAvatar,
  IonTitle,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonDatetime,
  IonCard,
  IonList,
  IonItemSliding,
  IonItem,
  IonLabel,
  IonPopover,
  IonItemOptions,
  IonItemOption,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { RefresherCustomEvent } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import {
  addCircle,
  cafeOutline,
  calendarNumberOutline,
  cashOutline,
  documentTextOutline,
  leafOutline,
  pencilOutline,
  trashOutline,
} from 'ionicons/icons';
import { WorksService } from 'src/app/core/services/works-service';
import { firstValueFrom } from 'rxjs';
import {
  TrabajosCalendario,
  WorkDone,
  WorksCalendar,
} from 'src/app/core/models/works';
import { NewWorkDoneComponent } from 'src/app/core/modals/new-work-done/new-work-done.component';
import { UIService } from 'src/app/core/services/uiservice';
import { LoadingComponent } from 'src/app/core/components/loading/loading.component';
import { User } from 'src/app/core/models/user';
import { UsersService } from 'src/app/core/services/users-service';

@Component({
  selector: 'app-works',
  templateUrl: './works.page.html',
  styleUrls: ['./works.page.scss'],
  standalone: true,
  imports: [
    IonSegmentButton,
    IonSegment,
    IonItemOption,
    IonItemOptions,
    IonPopover,
    IonLabel,
    IonItem,
    IonItemSliding,
    IonList,
    IonCard,
    IonDatetime,
    IonRefresherContent,
    IonRefresher,
    IonIcon,
    IonTitle,
    IonButton,
    IonButtons,
    IonToolbar,
    IonContent,
    IonHeader,
    CommonModule,
    FormsModule,
    LoadingComponent,
    IonSegment,
    IonSegmentButton,
  ],
})
export class WorksPage implements OnInit {
  selectedDate: string = new Date().toISOString();
  works: WorksCalendar[] = []; // Tu array general de trabajos de la BD
  selectedDayWorks: any[] = []; // Trabajos del día pinchado

  daysActive: number = 0; // Contador de dias activos
  currentMonth: string = new Date().toLocaleString('default', {
    month: 'long',
  });

  user: User | null = null;
  misTrabajos: TrabajosCalendario[] = [];
  trabajosEmpresa: TrabajosCalendario[] = [];
  highlightedDates: any[] = []; // Los puntitos del calendario

  private _worksService = inject(WorksService);
  private _modalCtrl = inject(ModalController);
  public _uiService = inject(UIService);
  private _cdr = inject(ChangeDetectorRef);
  private _alertCtrl = inject(AlertController);
  private _usersService = inject(UsersService);

  constructor() {
    addIcons({
      addCircle,
      cafeOutline,
      calendarNumberOutline,
      cashOutline,
      documentTextOutline,
      pencilOutline,
      trashOutline,
      leafOutline,
    });
  }

  async cargarTrabajosAgenda(
    accion: 'inicio' | 'refresh',
    event?: RefresherCustomEvent,
  ) {
    if (accion === 'inicio') {
      this._uiService.showLoading();
    }

    if (this.user) {
      let data = {
        userID: this.user.id,
        empresaID: this.user.empresa_id,
      };
      this._worksService.obtenerCalendario(data).subscribe({
        next: (res) => {
          if (res) {
            this.misTrabajos = res.misTrabajos || [];
            this.trabajosEmpresa = res.trabajosEmpresa || [];

            this.procesarFechasCalendario();
          }
        },
        error: (err) => {
          console.error('Error en la petición a la API:', err);
        },
      });
    }

    if (accion === 'refresh' && event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    } else if (accion === 'inicio') {
      setTimeout(() => {
        this._uiService.hideLoading();
        this._cdr.detectChanges();
      }, 1000);
    }

    // 3. Forzar que al cargar muestre los trabajos de "Hoy"
    this.filtrarTrabajosPorDia(this.selectedDate.split('T')[0]);
  }

  private procesarFechasCalendario() {
    const hoy = new Date();
    const anioMesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    const diasUnicos = new Set<string>();

    const fechasMap = new Map<
      string,
      { tieneMis: boolean; tieneEmpresa: boolean }
    >();

    this.misTrabajos.forEach((t) => {
      const fechaLimpia = t.fecha_trabajo.split('T')[0];
      const actual = fechasMap.get(fechaLimpia) || {
        tieneMis: false,
        tieneEmpresa: false,
      };
      fechasMap.set(fechaLimpia, { ...actual, tieneMis: true });
    });

    this.trabajosEmpresa.forEach((t) => {
      const fechaLimpia = t.fecha_trabajo.split('T')[0];
      const actual = fechasMap.get(fechaLimpia) || {
        tieneMis: false,
        tieneEmpresa: false,
      };
      fechasMap.set(fechaLimpia, { ...actual, tieneEmpresa: true });
    });

    this.highlightedDates = Array.from(fechasMap.entries()).map(
      ([date, flags]) => {
        // VERDE SOLO MÍS TRABAJOS
        // AMARILLO / NARANJA SI ES EMPRESA
        // AZUL SI ES AMBOS
        let color = 'var(--ion-color-olive-deep)';
        if (!flags.tieneMis && flags.tieneEmpresa) color = '#ffc409';
        if (flags.tieneMis && flags.tieneEmpresa) color = '#3880ff';

        // Contabilizamos el día solo si pertenece al año y mes actual
        if (date.startsWith(anioMesActual)) {
          diasUnicos.add(date);
        }

        return {
          date: date, // Formato YYYY-MM-DD para ion-datetime
          textColor: '#ffffff',
          backgroundColor: color,
        };
      },
    );

    /* this.highlightedDates = this.trabajosEmpresa.map((work: any) => {
      const fechaLimpia = work.fecha_trabajo.split('T')[0];

      // Contabilizamos el día solo si pertenece al año y mes actual
      if (fechaLimpia.startsWith(anioMesActual)) {
        diasUnicos.add(fechaLimpia);
      }

      return {
        date: work.date, // Formato YYYY-MM-DD para ion-datetime
        textColor: '#ffffff',
        backgroundColor: 'var(--ion-color-olive-deep)',
      };
    }); */

    // Guardamos los días activos del mes en curso para los KPIs
    this.daysActive = diasUnicos.size;
  }

  onDateSelected(event: any) {
    const fechaCompleta = event.detail.value; // ej: "2026-06-08T20:00:00..."
    this.selectedDate = fechaCompleta;
    const fechaLimpia = fechaCompleta.split('T')[0]; // "2026-06-08"

    this.filtrarTrabajosPorDia(fechaLimpia);
  }

  filtrarTrabajosPorDia(fecha: string) {
    if (this.user && this.user.rol === 'TRABAJADOR') {
      let misTrabajos = this.misTrabajos.filter(
        (w: any) => w.fecha_trabajo === fecha,
      );
      let trabajosEmpresa = this.trabajosEmpresa.filter(
        (w: any) => w.fecha_trabajo === fecha,
      );

      this.selectedDayWorks = misTrabajos.concat(trabajosEmpresa);
    } else if (this.user && this.user.rol === 'EMPRESA') {
      this.selectedDayWorks = this.trabajosEmpresa.filter(
        (w: any) => w.fecha_trabajo === fecha,
      );
    } else {
      this.selectedDayWorks = this.misTrabajos
        .filter((w: any) => w.fecha_trabajo === fecha)
        .concat(
          this.trabajosEmpresa.filter((w: any) => w.fecha_trabajo === fecha),
        );
    }
  }

  verDescripcion(event: Event, descripcion: string) {
    event.stopPropagation(); // Evita que se dispare el evento de la tarjeta principal

    // Aquí ya puedes abrir tu Popover o un Alert rápido para mostrar el texto
    console.log('Mostrando descripción:', descripcion);
  }

  async openNewWorkModal() {
    const modal = await this._modalCtrl.create({
      component: NewWorkDoneComponent,
      initialBreakpoint: 1, // For a "Sheet Modal"
      breakpoints: [0, 0.5, 0.75, 1],
      handle: true,
      mode: 'md',
      componentProps: { modo: 'add' },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.cargarTrabajosAgenda('inicio');
    }
  }

  async openEditWorkModal(work: WorkDone) {
    const modal = await this._modalCtrl.create({
      component: NewWorkDoneComponent,
      initialBreakpoint: 1, // For a "Sheet Modal"
      breakpoints: [0, 0.5, 0.75, 1],
      handle: true,
      mode: 'md',
      componentProps: { modo: 'edit', workDone: work },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.cargarTrabajosAgenda('inicio');
    }
  }

  async confirmDeleteWork(work: any) {
    const stringDate = work.fecha_trabajo.split('T')[0];
    const reversedDate = stringDate.split('-').reverse().join('-');
    const alert = await this._alertCtrl.create({
      mode: 'ios',
      backdropDismiss: false,
      header: '¿Desea eliminar este trabajo realizado?',
      message: `Vas a eliminar definitivamente el trabajo realizado en ${work.apodo_parcela || work.nombre_parcela} el ${reversedDate}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-cancel-button' },
        {
          text: 'Eliminar',
          cssClass: 'alert-delete-button',
          handler: () => this.deleteWork(work.id),
        },
      ],
    });

    await alert.present();
  }

  async deleteWork(workID: any) {
    this._uiService.showLoading();
    try {
      const response = await firstValueFrom(
        this._worksService.deleteWorkDone(workID),
      );
      this.cargarTrabajosAgenda('inicio');
    } catch (error) {
      console.error('Error en la petición a la API:', error);
    } finally {
      this._uiService.hideLoading();
    }
  }

  onSegmentChange(event: any) {}

  ionViewWillEnter() {
    this._uiService.hideLoading();
    //this.cargarTrabajosAgenda();
  }

  ngOnInit() {
    this.user = this._usersService.getUser();
    this.cargarTrabajosAgenda('inicio');
  }

  ionViewWillLeave() {
    this._uiService.hideLoading();
  }
}
