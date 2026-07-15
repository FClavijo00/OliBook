import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonicModule,
  ActionSheetController,
  AlertController,
  ToastController,
  ModalController,
  NavController
} from '@ionic/angular';
import * as L from 'leaflet';
import { Plot } from 'src/app/core/models/plots';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  copyOutline,
  createOutline,
  documentTextOutline,
  ellipsisVertical,
  pinOutline,
  resizeOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { SigpacService } from 'src/app/core/services/sigpac-service';
import proj4 from 'proj4';
import { LoadingComponent } from 'src/app/core/components/loading/loading.component';
import { NewPlotComponent } from 'src/app/core/modals/new-plot/new-plot.component';
import { PlotsService } from 'src/app/core/services/plots-service';
import { ToastService } from 'src/app/core/services/toast-service';

@Component({
  selector: 'plot-detail',
  templateUrl: './plot-detail.page.html',
  styleUrls: ['./plot-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, LoadingComponent],
})
export class PlotDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private _sigpacService = inject(SigpacService);
  private _modalCtrl = inject(ModalController);
  private _plotsService = inject(PlotsService);
  private _navCtrl = inject(NavController);
  private _toastService = inject(ToastService);

  public UTM30 = '+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs';
  public WGS84 = 'EPSG:4326';

  public loading: boolean = false;

  parcela: Plot = {
    id: 0,
    name: '',
    nickname: '',
    province: '',
    municipality: '',
    polygon: 0,
    parcel: 0,
    surface: 0,
    cadastral_reference: '',
    observations: '',
    lat: 0,
    lng: 0,
    x: 0,
    y: 0,
    wkt: '',
    works: [],
  };
  map!: L.Map;

  constructor() {
    addIcons({
      ellipsisVertical,
      trashOutline,
      createOutline,
      documentTextOutline,
      copyOutline,
      resizeOutline,
      pinOutline,
      checkmarkCircleOutline,
      timeOutline
    });
  }

  async openEditPlotModal() {
    const modal = await this._modalCtrl.create({
      component: NewPlotComponent,
      initialBreakpoint: 1, // For a "Sheet Modal"
      breakpoints: [0, 0.5, 0.75, 1],
      handle: true,
      mode: 'md',
      componentProps: { modo: 'edit', plot: this.parcela },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this._plotsService.plotsChanged.emit();
      await this._modalCtrl.dismiss(null, 'confirm');
      this._navCtrl.navigateForward('/tabs/plots');
      this._toastService.presentToast('Parcela actualizada con éxito.', 'toast-success', 'checkmark-circle-outline');

    } else if (role === 'cancel') {
      return;
    }
  }

  initMap() {
    if (this.map) this.map.remove();

    if (
      this.parcela.lat === null ||
      this.parcela.lat === 0 ||
      this.parcela.lng === null ||
      this.parcela.lng === 0
    ) {
      this.map = L.map('mapDetail', {
        zoomControl: false,
        attributionControl: false,
      }).setView([38.253271, -3.131313], 14);

      L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(this.map);
      /* L.tileLayer.wms('https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx', {
        layers: 'Catastro',
        format: 'image/png',
        transparent: true
      }).addTo(this.map); */

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.registrarCoordenadas(lat, lng);
      });
      // Forzar renderizado correcto
      setTimeout(() => this.map.invalidateSize(), 400);
    } else {
      // Centramos en las coordenadas de la parcela
      this.map = L.map('mapDetail', {
        zoomControl: false,
        attributionControl: false,
      }).setView([this.parcela.lat, this.parcela.lng], 18);

      L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(this.map);
      /* L.tileLayer.wms('https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx', {
        layers: 'Catastro',
        format: 'image/png',
        transparent: true
      }).addTo(this.map); */
      
      var myIcon = L.icon({
        iconUrl: 'assets/images/olive-ping.png',
        iconSize: [50, 50],
      });

      // Marcador con icono de olivo o estándar
      L.marker([this.parcela.lat, this.parcela.lng], { icon: myIcon }).addTo(
        this.map,
      );

      if (this.parcela.wkt !== '' || this.parcela.wkt !== null) {
        this.drawSigpacPolygon(this.parcela.wkt);
      }

      // Forzar renderizado correcto
      setTimeout(() => this.map.invalidateSize(), 400);
    }
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Gestión de Parcela',
      mode: 'ios',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Eliminar Parcela',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => this.confirmDelete(),
        },
        {
          text: 'Eliminar Ubicación',
          role: 'destructive',
          icon: 'pin-outline',
          handler: () => this.confirmDeleteCoords(),
        },
        {
          text: 'Editar Datos',
          icon: 'create-outline',
          handler: () => this.openEditPlotModal(),
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  async confirmDelete() {
    const alert = await this.alertCtrl.create({
      mode: 'ios',
      backdropDismiss: false,
      header: '¿Desea eliminar esta parcela?',
      message: `Vas a eliminar definitivamente la parcela: ${this.parcela?.nickname || this.parcela?.name}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'delete-button',
          handler: () => this.deletePlot(),
        },
      ],
    });
    await alert.present();
  }

  async confirmDeleteCoords() {
    const alert = await this.alertCtrl.create({
      mode: 'ios',
      backdropDismiss: false,
      header: '¿Desea eliminar la ubicación de esta parcela?',
      message: `Vas a eliminar la ubicación de la parcela: ${this.parcela?.nickname || this.parcela?.name}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'delete-button',
          handler: () => this.deletePlotCoords(),
        },
      ],
    });
    await alert.present();
  }

  registrarCoordenadas(lat: number, lng: number) {
    this.loading = true;
    this.parcela.lat = lat;
    this.parcela.lng = lng;

    let data = {
      id: this.parcela.id,
      lat: this.parcela.lat,
      lng: this.parcela.lng,
    };
    this._sigpacService.updateCoords(data).then((res) => {
      this.parcela.wkt = res.wkt;
      setTimeout(() => (this.loading = false), 1000);
      this.initMap();
    });
  }

  deletePlot() {
    this.loading = true;
    let data = { id: this.parcela.id };
    this._plotsService.deletePlot(data).subscribe((res) => {
      this._plotsService.plotsChanged.emit();
      this._modalCtrl.dismiss(null, 'confirm');
      this._navCtrl.navigateForward('/tabs/plots');
      this._toastService.presentToast(
        'Parcela eliminada con éxito.',
        'toast-success',
        'checkmark-circle-outline',
      );
      this.loading = false;
    });
  }

  deletePlotCoords() {
    this.loading = true;
    let data = { id: this.parcela.id };
    this._plotsService.deletePlotCoords(data).subscribe((res) => {
      this.parcela.wkt = '';
      this.parcela.lat = 0;
      this.parcela.lng = 0;
      this.parcela.x = 0;
      this.parcela.y = 0;
      this.initMap();
      this._toastService.presentToast(
        'Coordenadas eliminadas con éxito.',
        'toast-success',
        'checkmark-circle-outline',
      );
      this.loading = false;
    });
  }

  irAEditar() {
    // Redirigir al formulario enviando la parcela actual
    this.router.navigate(['/edit-plot'], { state: { parcela: this.parcela } });
  }

  async copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    this.showToast('Referencia copiada al portapapeles');
  }

  convertWKTToLeafletPolygon(wkt: string): L.LatLngExpression[] {
    // 1. Limpiamos el string para quedarnos solo con los números
    // Quitamos "POLYGON((" y "))"
    const coordsString = wkt.replace('POLYGON((', '').replace('))', '');

    // 2. Separamos por comas para obtener cada par X Y
    const pairs = coordsString.split(',');

    const leafletCoords = pairs.map((pair) => {
      const [x, y] = pair.trim().split(' ').map(Number);

      // 3. Convertimos de UTM (X, Y) a Lat/Lng
      // IMPORTANTE: proj4 devuelve [lng, lat]
      const [lng, lat] = proj4(this.UTM30, this.WGS84, [x, y]);

      return [lat, lng] as L.LatLngExpression;
    });

    return leafletCoords;
  }

  drawSigpacPolygon(wktString: string) {
    const coordinates = this.convertWKTToLeafletPolygon(wktString);
    L.polygon(coordinates, { color: 'green' }).addTo(this.map);
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  ngOnInit() {
    // Recuperamos los datos pasados por el router
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['plot']) {
      this.parcela = state['plot'];
    } else {
      // Si no hay datos, volvemos a la lista
      this.router.navigate(['tabs/home']);
    }
  }

  ionViewDidEnter() {
    if (this.parcela) {
      this.initMap();
    }
  }
}
