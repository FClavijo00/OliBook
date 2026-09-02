import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonLabel,
  IonItem,
  IonInput,
  IonListHeader,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  ellipsisVertical,
  mailOutline,
  personOutline,
  personCircleOutline,
} from 'ionicons/icons';
import { LoadingComponent } from 'src/app/core/components/loading/loading.component';
import { UIService } from 'src/app/core/services/uiservice';
import { User } from 'src/app/core/models/user';
import { UsersService } from 'src/app/core/services/users-service';

@Component({
  selector: 'app-datos-personales',
  templateUrl: './datos-personales.page.html',
  styleUrls: ['./datos-personales.page.scss'],
  standalone: true,
  imports: [
    IonChip,
    IonCardContent,
    IonCard,
    IonIcon,
    IonButton,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    LoadingComponent,
    ReactiveFormsModule,
    IonLabel,
  ],
})
export class DatosPersonalesPage implements OnInit {
  public _uiService = inject(UIService);
  private _fb = inject(FormBuilder);
  private _userService = inject(UsersService);

  public modoEdicion: boolean = false;
  public user: User | null = null;
  public datosPersonalesForm = this._fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });
  public iniciales: string = '';

  constructor() {
    addIcons({
      ellipsisVertical,
      personCircleOutline,
      personOutline,
      mailOutline,
    });
  }

  completarFormulario() {
    if (this.user) {
      this.datosPersonalesForm.patchValue({
        nombre: this.user.name,
        email: this.user.email,
      });
      /* this.datosPersonalesForm.controls['nombre'].disable();
      this.datosPersonalesForm.controls['email'].disable(); */
    }
  }

  construirIniciales() {
    if (this.user) {
      const palabras = this.user.name.split(' ');
      this.iniciales = palabras.map((palabra) => palabra.charAt(0)).join('');
    }
  }

  ngOnInit() {
    this.user = this._userService.getUser();

    this.completarFormulario();
    this.construirIniciales();
  }
}
