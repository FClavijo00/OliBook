import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonAvatar,
  IonIcon,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircle,
  addCircleOutline,
  search,
  closeOutline,
  cutOutline,
  waterOutline,
  leafOutline,
  createOutline,
  create,
  trashOutline,
  trash,
  chevronForwardOutline,
  checkmarkCircle,
} from 'ionicons/icons';
import { NewJobComponent } from 'src/app/core/modals/new-job/new-job.component';
import { NewPlotComponent } from 'src/app/core/modals/new-plot/new-plot.component';
import { ModalController, IonicModule, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { PlotsService } from 'src/app/core/services/plots-service';
import { Plot } from 'src/app/core/models/plots';
import { LoadingComponent } from 'src/app/core/components/loading/loading.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SigpacService } from 'src/app/core/services/sigpac-service';
import { firstValueFrom } from 'rxjs';
import { UIService } from 'src/app/core/services/uiservice';
import { ToastService } from 'src/app/core/services/toast-service';

@Component({
  selector: 'app-plots',
  templateUrl: './plots.page.html',
  styleUrls: ['./plots.page.scss'],
  standalone: true,
  imports: [IonicModule, LoadingComponent],
})
export class PlotsPage implements OnInit {
  public showSearchBar: boolean = false;
  //public loading: boolean = false;

  public userImageURL: string = environment.user.image_url || '';

  public plots: Plot[] = [];
  public filteredPlots: Plot[] = [];

  private _plotsService = inject(PlotsService);
  private _toastCtrl = inject(ToastController);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _sigpacService = inject(SigpacService);
  private _cdr = inject(ChangeDetectorRef);
  public _uiService = inject(UIService);
  private _toastService = inject(ToastService);

  constructor(private modalCtrl: ModalController) {
    addIcons({
      closeOutline,
      cutOutline,
      waterOutline,
      leafOutline,
      addCircleOutline,
      addCircle,
      search,
      createOutline,
      create,
      trashOutline,
      trash,
      chevronForwardOutline,
      checkmarkCircle,
    });
  }

  toggleSearchBar() {
    this.showSearchBar = !this.showSearchBar;
  }

  async openNewPlotModal() {
    const modal = await this.modalCtrl.create({
      component: NewPlotComponent,
      initialBreakpoint: 1, // For a "Sheet Modal"
      breakpoints: [0, 0.5, 0.75, 1],
      handle: true,
      mode: 'md',
      componentProps: { modo: 'add' },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this._plotsService.plotsChanged.emit();
      this._toastService.presentToast('Parcela creada con éxito.', 'toast-success', 'checkmark-circle-outline');
      this.getPlots();
    } else if (role === 'cancel') {
      return;
    }
  }

  searchPlots(event: any) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';

    if (query === '') {
      this.filteredPlots = [...this.plots];
    } else {
      this.filteredPlots = this.plots.filter((plot) => {
        const matchesNickname = plot.nickname?.toLowerCase().includes(query);
        const matchesName = plot.name?.toLowerCase().includes(query);
        return matchesNickname || matchesName;
      });
    }
  }

  async getPlots() {
    this._uiService.showLoading();

    try {
      const response = await firstValueFrom(this._plotsService.getPlots());
      this.plots = response || [];
      this.filteredPlots = [...this.plots];
    } catch (error) {
      console.error('Error en la petición a la API:', error);
    } finally {
      setTimeout(() => {
        this._uiService.hideLoading();
        this._cdr.detectChanges();
      }, 1500);
    }
  }

  openPlotDetail(plotSelected: Plot) {
    this._router.navigate(['/plot-detail'], { state: { plot: plotSelected } });
  }

  ionViewWillEnter() {
    this._uiService.hideLoading();
    this._plotsService.plotsChanged.subscribe(() => {
      this.getPlots();
    });
  }

  ngOnInit() {
    this.showSearchBar = false;
    this.getPlots();
    
  }

  ionViewWillLeave() {
    this._uiService.hideLoading();
  }
}
