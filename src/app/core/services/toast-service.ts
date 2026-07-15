import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  private _toastCtrl = inject(ToastController)

  constructor() { }

  async presentToast(message: string, color: string, icon: string) {
    const toast = await this._toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      mode: 'ios',
      icon: icon ,
      cssClass: color,
    });
    toast.present();
  }


  
}
