import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  newClient: any = {
    clientDoc: '',
    clientName: '',
    clientGender: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: ''
  };

  errors: any = {}; // Para manejar errores del backend
  emailTouched: boolean = false;  // Verificar si el usuario interactuó con el campo de email

  constructor(
    private apiService: ApiService,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void { }

  // Validación de formato de correo electrónico
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return emailPattern.test(email);
  }

  // Detectar cuando el usuario está escribiendo en el campo de correo
  onEmailInput(): void {
    this.emailTouched = true;  // Marcar que el campo de email fue tocado
  }

  // Enviar formulario para agregar cliente
  onSubmit(): void {
    this.apiService.post('clients', this.newClient, true).subscribe(
      (response) => {
        if (response.success) {
          this.utilitiesService.showAlert('success', response.message);
          this.router.navigate(['/clients']);
        }
      },
      (error) => {
        if (error.status === 422) { // Errores de validación desde el backend
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar el cliente');
        }
      }
    );
  }

  // Método para resetear el formulario
  resetForm(clientForm: any): void {
    clientForm.resetForm();  // Resetear los campos del formulario
    this.newClient = {       // Restablecer el estado inicial del objeto
      clientDoc: '',
      clientName: '',
      clientGender: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: ''
    };
    this.errors = {};
    this.emailTouched = false;
  }

  // Método para regresar a "/clients"
  goBack(): void {
    this.router.navigate(['/clients']);
  }

}