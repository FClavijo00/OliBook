import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { inject } from '@vercel/analytics';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  ngOnInit() {
    // Initialize Vercel Analytics
    // Only tracks in production mode by default
    inject({
      mode: environment.production ? 'production' : 'development',
      debug: !environment.production,
    });
  }
}
