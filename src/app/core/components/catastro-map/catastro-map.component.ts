import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'catastro-map',
  templateUrl: './catastro-map.component.html',
  styleUrls: ['./catastro-map.component.scss'],
})
export class CatastroMapComponent  implements OnInit {

  private _modalCtrl = inject(ModalController);

  constructor() { }

  initCatastroMap() {
    
  }

  ngOnInit() {}

}
