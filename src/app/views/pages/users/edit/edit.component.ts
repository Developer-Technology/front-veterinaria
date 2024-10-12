import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  user: any = {
    doc: '',
    name: '',
    sex: '',
    email: '',
    phone: '',
    status: 'Activo',
    privilege: 'User'
  };

  isLoading: boolean = true;  // Variable para el efecto de carga
  errors: any = {}; // Para manejar errores del backend
  isSuperAdmin: boolean = false;
  emailTouched: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    const encodedUserId = this.route.snapshot.paramMap.get('id') || '';
    const userId = atob(encodedUserId);
    this.loadUser(userId);
  }

  // Validación de formato de correo electrónico
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return emailPattern.test(email);
  }

  // Detectar cuando el usuario está escribiendo en el campo de correo
  onEmailInput(): void {
    this.emailTouched = true;  // Marcar que el campo de email fue tocado
  }

  // Cargar los datos del usuario desde la API
  loadUser(id: string): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get(`users/${id}`, true).subscribe(
      (response) => {
        if (response.success) {
          this.user = response.data;
          this.isLoading = false;  // Detener el estado de carga

          // Verificar si es Super Admin o tiene id = 1
          if (this.user.id === 1 || this.user.privilege === 'Super Admin') {
            this.router.navigate(['/users']);
            this.utilitiesService.showAlert('warning', 'No puedes editar este usuario');
          }
        }
      },
      (error) => {
        this.isLoading = false;  // Detener el estado de carga en caso de error
        if (error.status === 404) {
          // Usuario no encontrado
          this.utilitiesService.showAlert('error', 'Usuario no encontrado');
        } else {
          // Otro tipo de error
          this.utilitiesService.showAlert('error', 'No se pudo cargar el usuario');
        }
        this.router.navigate(['/users']);
      }
    );
  }

  // Actualizar usuario
  onSubmit(): void {
    this.apiService.put(`users/${this.user.id}`, this.user, true).subscribe(
      (response) => {
        this.utilitiesService.showAlert('success', 'Usuario actualizado correctamente');
        this.router.navigate(['/users']);
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar el usuario');
        }
      }
    );
  }

  // Función para resetear el formulario
  resetForm(form: any): void {
    form.reset();
    this.ngOnInit(); // Volver a cargar los datos originales
  }

  // Función para regresar a la lista de usuarios
  goBack(): void {
    this.router.navigate(['/users']);
  }

}