import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  newUser: any = {
    doc: '',
    name: '',
    sex: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    username: '', // Nuevo campo para el nombre de usuario
    status: 'Activo',
    privilege: 'User'
  };

  passwordMismatch: boolean = false;
  errors: any = {}; // Para manejar errores del backend
  emailTouched: boolean = false;  // Verificar si el usuario interactuó con el campo de email

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void { }

  // Validación de formato de correo electrónico
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return emailPattern.test(email);
  }

  // Detectar cuando el usuario está escribiendo en el campo de correo
  onEmailInput(): void {
    this.emailTouched = true;  // Marcar que el campo de email fue tocado
    this.generateUsername();   // Generar automáticamente el nombre de usuario
  }

  // Generar automáticamente el nombre de usuario a partir del correo y documento
  generateUsername(): void {
    if (this.newUser.email && this.newUser.doc) {
      const emailPrefix = this.newUser.email.split('@')[0];  // Obtener la parte antes de @
      this.newUser.username = `${emailPrefix}_${this.newUser.doc}`; // Combinar correo y doc
    }
  }

  // Verificar coincidencia de contraseñas y enviar formulario
  onSubmit(): void {
    this.passwordMismatch = this.newUser.password !== this.newUser.password_confirmation;
    if (this.passwordMismatch) {
      return;
    }

    this.apiService.post('auth/register', this.newUser, true).subscribe(
      (response) => {
        if (response.success) {
          this.showAlert('success', 'Usuario agregado correctamente');
          this.router.navigate(['/users']);
        }
      },
      (error) => {
        if (error.status === 422) { // Errores de validación desde el backend
          this.errors = error.error.errors;
        } else {
          Swal.fire('Error', 'No se pudo agregar el usuario', 'error');
        }
      }
    );
  }

  // Mostrar alertas con SweetAlert2
  showAlert(type: 'success' | 'error' | 'warning' | 'info' | 'question', message: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      text: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

}