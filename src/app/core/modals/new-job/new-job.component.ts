import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { ModalController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-new-job',
  templateUrl: './new-job.component.html',
  styleUrls: ['./new-job.component.scss'],
  imports: [IonicModule, ReactiveFormsModule],
})
export class NewJobComponent implements OnInit {
  trabajoForm: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
  ) {
    this.trabajoForm = this.fb.group({
      tipo: ['poda', Validators.required],
      fecha: [new Date().toISOString(), Validators.required],
      notas: [''],
    });
  }

  ngOnInit() {}

  cerrar() {
    this.modalCtrl.dismiss();
  }

  guardar() {
    const data = this.trabajoForm.value;
    // Aquí enviarías los datos a un servicio
    this.modalCtrl.dismiss(data);
  }
}
