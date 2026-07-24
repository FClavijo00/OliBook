import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from "@ionic/angular";
import { addIcons } from 'ionicons';
import { alertCircleOutline, businessOutline, cameraOutline, checkmarkCircleOutline, eyeOffOutline, eyeOutline, informationCircle, leaf, lockClosedOutline, logInOutline, mailOutline, personAddOutline, personOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/app/core/models/user';
import { ToastService } from 'src/app/core/services/toast-service';
import { UsersService } from 'src/app/core/services/users-service';

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
  loadingSpinner: boolean = false;

  private _userService = inject(UsersService);
  private _toastService = inject(ToastService);
  private _router = inject(Router);

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
      cameraOutline,
      informationCircle,
      checkmarkCircleOutline,
      alertCircleOutline
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
      tipoUsuario: ['PARTICULAR'],
      nombre: [''],
      fotoUrl: [''],
      nombreEmpresa: [''],
      codigoEmpresa: ['']
    });
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
    const nombreControl = this.authForm.get('nombre');
    const empresaControl = this.authForm.get('nombreEmpresa');
    const codigoControl = this.authForm.get('codigoEmpresa');
    const tipoControl = this.authForm.get('tipoUsuario');
    const passControl = this.authForm.get('password');

    if (this.isRegister) {
      // Si pasa a registro, el nombre es obligatorio
      nombreControl?.setValidators([Validators.required, Validators.minLength(2)]);
      passControl?.setValue('');
    } else {
      // Si vuelve a login, limpiamos el campo y sus validaciones
      nombreControl?.clearValidators();
      nombreControl?.setValue('');

      empresaControl?.clearValidators();
      empresaControl?.setValue('');

      codigoControl?.clearValidators();
      codigoControl?.setValue('');

      tipoControl?.setValue('PARTICULAR');

      passControl?.setValue('');
    }
    
    nombreControl?.updateValueAndValidity();
    empresaControl?.updateValueAndValidity();
    codigoControl?.updateValueAndValidity();
    tipoControl?.updateValueAndValidity();
  }

  changeTipoUsuario() {
    const tipoControl = this.authForm.get('tipoUsuario');
    const empresaControl = this.authForm.get('nombreEmpresa');
    const codigoControl = this.authForm.get('codigoEmpresa');
    if (tipoControl?.value === 'EMPRESA') {
      this.isEnterprise = true;
      empresaControl?.setValidators([Validators.required, Validators.minLength(2)]);
      empresaControl?.updateValueAndValidity();
      codigoControl?.clearValidators();
      codigoControl?.setValue(null);
      codigoControl?.updateValueAndValidity();
    } else if (tipoControl?.value === 'TRABAJADOR') {
      this.isEnterprise = false;
      empresaControl?.clearValidators();
      empresaControl?.setValue(null);
      empresaControl?.updateValueAndValidity();
      codigoControl?.setValidators([Validators.required, Validators.minLength(2)]);
      codigoControl?.updateValueAndValidity();
    } else if (tipoControl?.value === 'PARTICULAR') {
      this.isEnterprise = false;
      empresaControl?.clearValidators();
      empresaControl?.setValue(null);
      empresaControl?.updateValueAndValidity();
      codigoControl?.clearValidators();
      codigoControl?.setValue(null);
      codigoControl?.updateValueAndValidity();
    }
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

  async onSubmit() {
    if (this.authForm.invalid) return;

    this.loadingSpinner = true;
    const credentials = this.authForm.value;
    
    if (this.isRegister) {
      console.log('Registrando usuario:', credentials);
      try {
        const response = await firstValueFrom(this._userService.register(credentials));
        if (response) {
          this._toastService.presentToast(
            'Usuario registrado correctamente.',
            'toast-success',
            'checkmark-circle-outline'
          )
        }
        this.toggleMode();
      } catch (error: HttpErrorResponse | any) {
        if (error.status === 400) {
          this._toastService.presentToast(
            'El código de empresa proporcionado no es correcto.',
            'toast-error',
            'alert-circle-outline'
          )
        }
      } finally {
        this.loadingSpinner = false;
      }
    } else {
      let loginData = { email: credentials.email, password: credentials.password };
      try {
        const response = await firstValueFrom(this._userService.login(loginData));
        if (response) {
          this._toastService.presentToast(
            'Inicio de sesión realizado con éxito.',
            'toast-success',
            'checkmark-circle-outline'
          );
          this._router.navigate(['/tabs/home']);
        }
      } catch (error: HttpErrorResponse | any) {
        if (error.status === 401) {
          this._toastService.presentToast(
            'Usuario o contraseña incorrectos. Pruebe de nuevo.',
            'toast-error',
            'alert-circle-outline'
          )
        } else {
          this._toastService.presentToast(
            'Ha ocurrido un error inesperado. Pruebe de nuevo.',
            'toast-error',
            'alert-circle-outline'
          )
        }
      } finally {
        this.loadingSpinner = false;
      }
    }
  }
}