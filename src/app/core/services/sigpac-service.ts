import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import proj4 from 'proj4';

@Injectable({ providedIn: 'root' })

export class SigpacService {

  public apiUrl: string = 'http://localhost:3000/api/sigpac';

  private _http = inject(HttpClient);

  // Definimos las proyecciones
  // WGS84: El estándar GPS
  // ETRS89 / UTM zone 30N: El estándar oficial en España (EPSG:25830)
  private readonly WGS84 = 'EPSG:4326';
  private readonly UTM30 = '+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs';

  constructor() {
    //Registramos la proyección en el objeto proj4
    proj4.defs('EPSG:25830', this.UTM30);
  }

  async getParcelaByCoordsIONIC(lat: number, lng: number) {
    // 1. Convertimos las coordenadas WGS84 a UTM30
    const [x, y] = proj4(this.WGS84, this.UTM30, [lng, lat]);

    // 2. Creamos un BBOX (Caja de búsqueda) de 1 metro de lado alrededor del punto
    const delta = 0.5;
    const bbox = `${x - delta},${y - delta},${x + delta},${y + delta}`;

    // 3. Construimos la URL de la API oficial (FEGA)
    const url = `https://sigpac.mapa.gob.es/fega/ServiciosWMS?` +
      `SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&` +
      `LAYERS=PARCELA&QUERY_LAYERS=PARCELA&` +
      `BBOX=${bbox}&` +
      `WIDTH=10&HEIGHT=10&X=5&Y=5&` +
      `SRS=EPSG:25830&INFO_FORMAT=application/json`;

    // 4. Hacemos la petición HTTP y obtenemos la parcela
    try {
      const resp: any = await firstValueFrom(this._http.get(url));
      return this.parseResponse(resp, lat, lng);
    } catch (error) {
      console.error('Error en la petición al SIGPAC:', error);
      throw error;
    }
  }

  private parseResponse(response: any, lat: number, lng: number) {
    if (!response || !response.features || response.features.length === 0) {
      return null;
    }

    const data = response.features[0].properties;

    // Mapeamos los campos del SIGPAC a nuestro modelo de "Olivo"
    return {
      nombre: `Parcela ${data.PARCELA}`, // Nombre por defecto
      provincia: data.PROVINCIA,
      municipio: data.MUNICIPIO,
      agregado: data.AGREGADO,
      zona: data.ZONA,
      poligono: data.POLIGONO,
      parcela: data.PARCELA,
      superficie: data.SUPERFICIE / 10000, // Convertimos de m² a Hectáreas
      referenciaCatastral: data.REF_CATASTRAL,
      lat: lat,
      lng: lng
    };
  }

  async getParcelaByCoords(lat: number, lng: number) {
    const url = `${this.apiUrl}/plotByCoords`;

    try {
      const resp: any = await firstValueFrom(this._http.post(url, { lat, lng }));
      return resp;
    } catch (error) {
      console.error('Error en la petición al SIGPAC:', error);
      throw error;
    }
  }

  async updateCoords(data: any) {
    const url = `${this.apiUrl}/updateCoords`;
    try {
      const resp: any = await firstValueFrom(this._http.post(url, data));
      return resp;
    } catch (error) {
      console.error('Error en la petición al SIGPAC:', error);
      throw error;
    }
  }

}
