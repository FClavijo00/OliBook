import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import {
  IonicModule,
  AlertController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircle,
  alertCircleOutline,
  checkmarkCircle,
  closeCircle,
  globe,
  globeOutline,
  informationCircle,
  saveOutline,
} from 'ionicons/icons';
import * as L from 'leaflet';
import proj4 from 'proj4';
import { firstValueFrom, timeout } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlotsService } from '../../services/plots-service';
import { Plot } from '../../models/plots';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SigpacService } from '../../services/sigpac-service';

@Component({
  selector: 'app-new-plot',
  templateUrl: './new-plot.component.html',
  styleUrls: ['./new-plot.component.scss'],
  imports: [IonicModule, ReactiveFormsModule, LoadingComponent],
})
export class NewPlotComponent implements OnInit {

  @Input() modo: 'add' | 'edit' = 'add';
  @Input() plot: any;

  public title = 'Nueva Parcela';

  public isAlertOpen: boolean = false;
  public alertButtons = ['OK'];

  public newPlotForm: FormGroup = inject(FormBuilder).group({
    name: ['', Validators.required],
    nickname: [''],
    province: ['', Validators.required],
    municipality: ['', Validators.required],
    polygon: ['', Validators.required],
    parcel: ['', Validators.required],
    surface: ['', Validators.required],
    cadastral_reference: [''],
    observations: [''],
    lat: [''],
    lng: [''],
    x: [''],
    y: [''],
    wkt: [''],
  });

  public map!: L.Map;
  public marker!: L.Marker;

  public loading: boolean = false;
  public tipoLoading: 'add' | 'edit' | '' = '';

  private _modalCtrl = inject(ModalController);
  private _toastCtrl = inject(ToastController);
  private _alertCtrl = inject(AlertController);
  private _http = inject(HttpClient);
  private _plotService = inject(PlotsService);
  private _sigpacService = inject(SigpacService);
  private _cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({
      informationCircle,
      saveOutline,
      globe,
      globeOutline,
      checkmarkCircle,
      closeCircle,
      alertCircle,
      alertCircleOutline
    });
    // Definimos los sistemas de coordenadas
    // WGS84: El que usa el GPS/Google Maps
    // ETRS89 / UTM zone 30N: El que usa el SIGPAC (España)
    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
    proj4.defs(
      'EPSG:25830',
      '+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    );
  }

  convertirWgs84aUtm30(lat: number, lng: number) {
    // Convertimos de [lng, lat] a [x, y] en metros
    const [x, y] = proj4('EPSG:4326', 'EPSG:25830', [lng, lat]);
    return { x, y };
  }

  // Ejemplo de URL para obtener información de la parcela (GetFeatureInfo)
  getUrlInformacion(lat: number, lng: number) {
    const coords = this.convertirWgs84aUtm30(lat, lng);

    // El SIGPAC necesita un BBOX (una caja pequeña alrededor del punto)
    const delta = 1; // 1 metro de margen
    const bbox = `${coords.x - delta},${coords.y - delta},${coords.x + delta},${coords.y + delta}`;

    return (
      `https://sigpac.mapa.gob.es/fega/ServiciosWMS?` +
      `SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&` +
      `LAYERS=PARCELA&QUERY_LAYERS=PARCELA&` +
      `BBOX=${bbox}&` +
      `WIDTH=10&HEIGHT=10&X=5&Y=5&` + // Simulamos un click en el centro de una imagen 10x10
      `SRS=EPSG:25830&INFO_FORMAT=application/json`
    );
  }

  async importSigpacData() {
    if (!this.marker) {
      this._toastCtrl.create({
        message: 'No se ha seleccionado ninguna parcela en el mapa.',
        duration: 2000,
        position: 'bottom',
        mode: 'ios',
        icon: 'alert-circle-outline',
        cssClass: 'toast-error',
      });
      return;
    }
    const coords = this.marker.getLatLng();
    this.closeModalSigpac();
    this.tipoLoading = '';
    this.loading = true;
    try {
      this._sigpacService.getParcelaByCoords(coords.lat, coords.lng).then((data) => {
        if (data) {
          this.newPlotForm.patchValue(data);
        }
      });
    } catch (error) {
      console.error('Error en la petición al SIGPAC:', error);
    } finally {
      setTimeout(() => {
        this.loading = false;
        this._cdr.detectChanges(); // Fuerza a Angular a ocultar el spinner
      }, 1000);
    }
  }

  async obtenerDatosParcela(lat: number, lng: number) {
    const url = this.getUrlInformacion(lat, lng);

    // Convertimos el Observable a Promesa para usar await
    try {
      const response: any = await firstValueFrom(this._http.get(url));
      return this.procesarRespuesta(response);
    } catch (error) {
      console.error('Error en la petición al SIGPAC:', error);
      return null;
    }
  }

  private procesarRespuesta(res: any) {
    // El SIGPAC devuelve un JSON con una estructura profunda (GeoJSON)
    if (res && res.features && res.features.length > 0) {
      const props = res.features[0].properties;
      return {
        provincia: props.PROVINCIA,
        municipio: props.MUNICIPIO,
        poligono: props.POLIGONO,
        parcela: props.PARCELA,
        recinto: props.RECINTO,
        superficie: props.SUPERFICIE, // OJO: suele venir en m2 o hectáreas
        referencia: props.REF_CATASTRAL,
      };
    }
    return null;
  }

  initMap() {
    if (this.map) this.resetMap();

    // 1. Centrar en una posición inicial (ej. tu zona de olivos)
    this.map = L.map('mapDetail', {
      zoomControl: false,
      attributionControl: false,
    }).setView([38.253271, -3.131313], 14);

    // 2. Capa base de Satélite (muy útil para agricultores)
    L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      opacity: 0.85,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.map);
    L.tileLayer.wms('https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx', {
      layers: 'Catastro',
      format: 'image/png',
      transparent: true
    }).addTo(this.map);

    // 3. Capturar el click
    var myIcon = L.icon({
      iconUrl: 'assets/images/olive-ping.png',
      iconSize: [50, 50],
    });
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) this.map.removeLayer(this.marker);
      const { lat, lng } = e.latlng;
      this.marker = L.marker([lat, lng], { icon: myIcon }).addTo(this.map);
      this._cdr.detectChanges();
      //this.obtenerDatosParcela(lat, lng); // Aquí ya funciona el 'this'
    });

    // 4. Forzar renderizado correcto
    setTimeout(() => this.map.invalidateSize(), 400);
  }

  resetMap() {
    // 1. Destruimos el mapa por completo
    if (this.map) this.map.remove();
    // 2. Limpiamos la referencia al marcador
    if (this.marker) this.marker.remove();
  }

  obtenerDatosDesdeSigpac(lat: number, lng: number) {
    // Aquí llamarías a tu servicio
    console.log(`Buscando parcela en: ${lat}, ${lng}`);
    this.getUrlInformacion(lat, lng);

    // Al recibir la respuesta, autorellenamos el formulario:
    // this.parcelaForm.patchValue({ superficie: data.area, poligono: data.poligono });
  }

  async openInfoAlert() {
    const alert = await this._alertCtrl.create({
      header: 'APODO',
      subHeader: 'Dejar en blanco en caso de usar nombre por defecto.',
      message:
        'Nombre de apodo con el que conoces la parcela. Aparecerá como nombre principal en el listado de parcelas si se completa.',
      buttons: ['OK'],
      backdropDismiss: false,
      mode: 'ios',
    });
    setTimeout(async () => {
      await alert.present();
    }, 100);
  }

  /** GETTERS FORM */
  get nameControl() {
    return this.newPlotForm.get('name');
  }

  get nicknameControl() {
    return this.newPlotForm.get('nickname');
  }

  get provinceControl() {
    return this.newPlotForm.get('province');
  }

  get municipalityControl() {
    return this.newPlotForm.get('municipality');
  }

  get polygonControl() {
    return this.newPlotForm.get('polygon');
  }

  get parcelControl() {
    return this.newPlotForm.get('parcel');
  }

  get surfaceControl() {
    return this.newPlotForm.get('surface');
  }

  get cadastralReferenceControl() {
    return this.newPlotForm.get('cadastral_reference');
  }

  get observationsControl() {
    return this.newPlotForm.get('observations');
  }

  onSubmit() {
    switch (this.modo) {
      case 'add':
        this.tipoLoading = 'add';
        if (this.newPlotForm.invalid) {
          this.newPlotForm.markAllAsTouched();
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
          const plot: Plot = {
            id: 0,
            name: this.newPlotForm.value.name,
            nickname: this.newPlotForm.value.nickname,
            province: this.newPlotForm.value.province,
            municipality: this.newPlotForm.value.municipality,
            polygon: this.newPlotForm.value.polygon,
            parcel: this.newPlotForm.value.parcel,
            surface: this.newPlotForm.value.surface,
            cadastral_reference: this.newPlotForm.value.cadastral_reference,
            observations: this.newPlotForm.value.observations,
            lat: this.newPlotForm.value.lat || null,
            lng: this.newPlotForm.value.lng || null,
            x: this.newPlotForm.value.x || null,
            y: this.newPlotForm.value.y || null,
            wkt: this.newPlotForm.value.wkt || '',
            works: [],
          };
          this._plotService.addNewPlot(plot).subscribe((res) => {
            setTimeout(async () => {
              this._toastCtrl.create({
                message: 'Parcela creada con exito',
                duration: 2000,
                position: 'bottom',
                mode: 'ios',
                icon: 'checkmark-circle',
                cssClass: 'toast-success',
              });
              this.loading = false;
              this._modalCtrl.dismiss(res, 'confirm');
            }, 2000);
          });
        }
        break;
      case 'edit':
        this.tipoLoading = 'edit';
        if (this.newPlotForm.invalid) {
          this.newPlotForm.markAllAsTouched();
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
          const plot: Plot = {
            id: this.plot.id,
            name: this.newPlotForm.value.name,
            nickname: this.newPlotForm.value.nickname,
            province: this.newPlotForm.value.province,
            municipality: this.newPlotForm.value.municipality,
            polygon: this.newPlotForm.value.polygon,
            parcel: this.newPlotForm.value.parcel,
            surface: this.newPlotForm.value.surface,
            cadastral_reference: this.newPlotForm.value.cadastral_reference,
            observations: this.newPlotForm.value.observations,
            lat: this.plot.lat || null,
            lng: this.plot.lng || null,
            x: this.plot.x || null,
            y: this.plot.y || null,
            wkt: this.plot.wkt || '',
            works: []
          };
          this._plotService.editPlot(plot).subscribe((res) => {
            setTimeout(async () => {
              this._toastCtrl.create({
                message: 'Parcela editada con exito',
                duration: 2000,
                position: 'bottom',
                mode: 'ios',
                icon: 'checkmark-circle',
                cssClass: 'toast-success',
              });
              this.loading = false;
              this._modalCtrl.dismiss(res, 'confirm');
            }, 2000);
          });
        }
        break;
    }
  }

  closeModalNewPlot() {
    this._modalCtrl.dismiss(null, 'cancel');
  }

  closeModalSigpac() {
    //this.resetMap();
    this._modalCtrl.dismiss(null, 'cancel');
  }

  // En Ionic, este es el mejor momento para cargar mapas
  ionViewDidEnter() {
    //this.initMap();
  }

  ngOnInit() {
    this.loading = false;
    this.tipoLoading = '';
    switch (this.modo) {
      case 'add':

        this.title = 'Nueva parcela';
        this.newPlotForm.reset();
        break;
      case 'edit':
        this.title = 'Editar parcela';
        this.newPlotForm.patchValue(this.plot);
        break;
      default:
        this.title = 'Nueva parcela';
        break;
    }
  }
}
