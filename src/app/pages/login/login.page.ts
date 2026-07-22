import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from "@ionic/angular";
import { addIcons } from 'ionicons';
import { businessOutline, cameraOutline, eyeOffOutline, eyeOutline, leaf, lockClosedOutline, logInOutline, mailOutline, personAddOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, ReactiveFormsModule],
})
export class LoginPage implements OnInit {
  authForm!: FormGroup;
  isRegister: boolean = false;
  showPassword: boolean = false;
  isEnterprise: boolean = false;
  avatarPreview: string | null = null;

  constructor(private _fb: FormBuilder) {
    addIcons({
      leaf,
      personOutline,
      mailOutline,
      lockClosedOutline,
      eyeOffOutline,
      eyeOutline,
      personAddOutline,
      logInOutline,
      businessOutline,
      cameraOutline
    })
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.authForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // Campos de Registro
      nombre: [''],
      fotoUrl: [''],
      isEmpresa: [false],
      nombreEmpresa: ['']
    });
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
    const nombreControl = this.authForm.get('nombre');

    if (this.isRegister) {
      // Si pasa a registro, el nombre es obligatorio
      nombreControl?.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      // Si vuelve a login, limpiamos el campo y sus validaciones
      nombreControl?.clearValidators();
      nombreControl?.setValue('');
    }
    
    nombreControl?.updateValueAndValidity();
  }

  // Manejador para seleccionar o subir la foto de perfil
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
        this.authForm.patchValue({ fotoUrl: this.avatarPreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    const credentials = this.authForm.value;
    
    if (this.isRegister) {
      console.log('Registrando usuario:', credentials);
      // Aquí irá la llamada a: this._authService.register(credentials)
    } else {
      console.log('Iniciando sesión con:', { email: credentials.email, password: credentials.password });
      // Aquí irá la llamada a: this._authService.login(credentials)
    }
  }
}