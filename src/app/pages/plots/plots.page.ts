import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { NewPlotComponent } from 'src/app/core/modals/new-plot/new-plot.component';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonAvatar,
  IonTitle,
  IonIcon,
  IonSearchbar,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  RefresherCustomEvent,
  NavController,
} from '@ionic/angular/standalone';
import { PlotsService } from 'src/app/core/services/plots-service';
import { Plot } from 'src/app/core/models/plots';
import { LoadingComponent } from 'src/app/core/components/loading/loading.component';
import { firstValueFrom } from 'rxjs';
import { UIService } from 'src/app/core/services/uiservice';
import { ToastService } from 'src/app/core/services/toast-service';
import { User } from 'src/app/core/models/user';
import { UsersService } from 'src/app/core/services/users-service';

@Component({
  selector: 'app-plots',
  templateUrl: './plots.page.html',
  styleUrls: ['./plots.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonItem,
    IonList,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    IonSearchbar,
    IonIcon,
    IonTitle,
    IonButton,
    IonButtons,
    IonToolbar,
    IonHeader,
    LoadingComponent
],
})
export class PlotsPage implements OnInit {
  public user: User | null = null;

  public showSearchBar: boolean = false;

  public parcelas: Plot[] = [];
  public parcelasFiltradas: Plot[] = [];

  private _plotsService = inject(PlotsService);
  //private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);
  public _uiService = inject(UIService);
  private _toastService = inject(ToastService);
  private _usersService = inject(UsersService);
  private _navCtrl = inject(NavController);

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

  async abrirModalNuevaParcela() {
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
      this._toastService.presentToast(
        'Parcela creada con éxito.',
        'toast-success',
        'checkmark-circle-outline',
      );
      this.obtenerParcelas('inicio');
    } else if (role === 'cancel') {
      return;
    }
  }

  buscarParcela(event: any) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';

    if (query === '') {
      this.parcelasFiltradas = [...this.parcelas];
    } else {
      this.parcelasFiltradas = this.parcelas.filter((parcela) => {
        const matchesNickname = parcela.apodo_parcela
          ?.toLowerCase()
          .includes(query);
        const matchesName = parcela.nombre_parcela?.toLowerCase().includes(query);
        return matchesNickname || matchesName;
      });
    }
  }

  async obtenerParcelas(
    accion: 'inicio' | 'refresh',
    event?: RefresherCustomEvent,
  ) {
    if (accion === 'inicio') {
      this._uiService.showLoading();
    }

    await this.fetchPlotsFromAPI();

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
  }

  private async fetchPlotsFromAPI() {
    try {
      const response = await firstValueFrom(
        this._plotsService.obtenerParcelas(this.user?.id),
      );
      this.parcelas = response || [];
      this.parcelasFiltradas = [...this.parcelas];
    } catch (error) {
      console.error('Error en la petición a la API:', error);
    }
  }

  abrirDetalleParcela(parcelaSelected: Plot) {
    this._navCtrl.navigateForward(['/plot-detail'], { state: { parcela: parcelaSelected } });
  }

  ionViewWillEnter() {
    this._uiService.hideLoading();
    this._plotsService.plotsChanged.subscribe(() => {
      this.obtenerParcelas('inicio');
    });
  }

  ngOnInit() {
    this.user = this._usersService.getUser();
    if (!this.user) {
      this._navCtrl.navigateRoot(['/login']);
    }

    this.showSearchBar = false;
    this.obtenerParcelas('inicio');
  }

  ionViewWillLeave() {
    this._uiService.hideLoading();
  }
}
