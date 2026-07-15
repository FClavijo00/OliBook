export interface Plot {
    id: number,
    name: string,
    nickname: string, 
    province: string,
    municipality: string,
    polygon: number,
    parcel: number,
    surface: number,
    cadastral_reference: string,
    observations: string,
    lat: number,
    lng: number,
    x: number,
    y: number,
    wkt: string,
    works: Array<any>
}