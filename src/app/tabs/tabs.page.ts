import { Component, EnvironmentInjector, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { home, homeOutline, checkmarkCircle, checkmarkCircleOutline, personCircle, personCircleOutline, leaf, leafOutline } from 'ionicons/icons';
import { IonicModule } from '@ionic/angular';


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
    addIcons({ home, homeOutline, leaf, leafOutline, checkmarkCircle, checkmarkCircleOutline, personCircle, personCircleOutline });
  }

  setCurrentTab(event: any) {
    this.currentTab = event.tab;
  }
}
