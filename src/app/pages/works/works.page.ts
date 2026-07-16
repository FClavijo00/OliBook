import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
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
import { WorkDone, WorksCalendar } from 'src/app/core/models/works';
import { NewWorkDoneComponent } from 'src/app/core/modals/new-work-done/new-work-done.component';
import { UIService } from 'src/app/core/services/uiservice';
import { LoadingComponent } from "src/app/core/components/loading/loading.component";

@Component({
  selector: 'app-works',
  templateUrl: './works.page.html',
  styleUrls: ['./works.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, LoadingComponent],
})
export class WorksPage implements OnInit {
  
  public userImageURL: string = environment.user.image_url || '';

  selectedDate: string = new Date().toISOString();
  works: WorksCalendar[] = []; // Tu array general de trabajos de la BD
  selectedDayWorks: any[] = []; // Trabajos del día pinchado
  highlightedDates: any[] = []; // Los puntitos del calendario
  daysActive: number = 0; // Contador de dias activos
  currentMonth: string = new Date().toLocaleString('default', { month: 'long' });

  private _worksService = inject(WorksService);
  private _modalCtrl = inject(ModalController);
  public _uiService = inject(UIService);
  private _cdr = inject(ChangeDetectorRef);
  private _alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ addCircle, cafeOutline, calendarNumberOutline, cashOutline, documentTextOutline, pencilOutline, trashOutline, leafOutline });
  }

  async cargarTrabajosAgenda() {
    this._uiService.showLoading();
    try {
      const response = await firstValueFrom(
        this._worksService.getWorksCalendar(),
      );
      this.works = response || [];

      const hoy = new Date();
      const anioMesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

      const diasUnicos = new Set<string>();
      this.highlightedDates = this.works.map((work: any) => {
        const fechaLimpia = work.date.split('T')[0];

        if (fechaLimpia.startsWith(anioMesActual)) {
          diasUnicos.add(fechaLimpia);
        }

        return {
          date: work.date, // Debe tener formato YYYY-MM-DD
          textColor: '#ffffff',
          backgroundColor: 'var(--ion-color-olive-deep)', // Tu color verde olivo
        };
      });

      this.daysActive = diasUnicos.size;

    } catch (error) {
      console.error('Error en la petición a la API:', error);
    } finally {
      this._uiService.hideLoading();
      this._cdr.detectChanges();
    }

    // 3. Forzar que al cargar muestre los trabajos de "Hoy"
    this.filtrarTrabajosPorDia(this.selectedDate.split('T')[0]);
  }

  onDateSelected(event: any) {
    const fechaCompleta = event.detail.value; // ej: "2026-06-08T20:00:00..."
    this.selectedDate = fechaCompleta;
    const fechaLimpia = fechaCompleta.split('T')[0]; // "2026-06-08"

    this.filtrarTrabajosPorDia(fechaLimpia);
  }

  filtrarTrabajosPorDia(fecha: string) {
    this.selectedDayWorks = this.works.filter((w: any) => w.date === fecha);
  }

  verDescripcion(event: Event, descripcion: string) {
    event.stopPropagation(); // Evita que se dispare el evento de la tarjeta principal

    // Aquí ya puedes abrir tu Popover o un Alert rápido para mostrar el texto
    console.log("Mostrando descripción:", descripcion);
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
      this.cargarTrabajosAgenda();
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
      this.cargarTrabajosAgenda();
    }
  }

  async confirmDeleteWork(work: any) {
    const stringDate = work.date.split('T')[0];
    const reversedDate = stringDate.split('-').reverse().join('-');
    const alert = await this._alertCtrl.create({
      mode: 'ios',
      backdropDismiss: false,
      header: '¿Desea eliminar este trabajo realizado?',
      message: `Vas a eliminar definitivamente el trabajo realizado en ${work.plot_nickname || work.plot_name} el ${reversedDate}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-cancel-button' },
        {
          text: 'Eliminar',
          cssClass: 'alert-delete-button',
          handler: () => this.deleteWork(work.id),
        },
      ]
    });

    await alert.present();
  }

  async deleteWork(workID: any) {
    this._uiService.showLoading();
    try {
      const response = await firstValueFrom(
        this._worksService.deleteWorkDone(workID),
      );
      this.cargarTrabajosAgenda();
    } catch (error) {
      console.error('Error en la petición a la API:', error);
    } finally {
      this._uiService.hideLoading();
    }
  }
  ionViewWillEnter() {
    this._uiService.hideLoading();
    //this.cargarTrabajosAgenda();
  }

  ngOnInit() {
    this.cargarTrabajosAgenda();
  }

  ionViewWillLeave() {
    this._uiService.hideLoading();
  }

  
}
