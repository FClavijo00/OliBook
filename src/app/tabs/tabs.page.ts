import { Component, EnvironmentInjector, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square, home, homeOutline, layers, layersOutline, checkmarkCircle, checkmarkCircleOutline, location, locationOutline, personCircle, personCircleOutline } from 'ionicons/icons';
import { ModalController, IonicModule, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonicModule],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  currentTab: string = 'home';

  constructor() {
    addIcons({ triangle, ellipse, square, home, homeOutline, layers, layersOutline, checkmarkCircle, checkmarkCircleOutline, location, locationOutline, personCircle, personCircleOutline });
  }

  setCurrentTab(event: any) {
    this.currentTab = event.tab;
  }
}
