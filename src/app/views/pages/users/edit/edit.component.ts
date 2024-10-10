import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';

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

  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const encodedUserId = this.route.snapshot.paramMap.get('id') || '';
    const userId = atob(encodedUserId);
    this.loadUser(userId);
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
            this.showAlert('warning', 'No puedes editar este usuario');
          }
        }
      },
      (error) => {
        this.isLoading = false;  // Detener el estado de carga en caso de error
        if (error.status === 404) {
          // Usuario no encontrado
          this.showAlert('error', 'Usuario no encontrado');
        } else {
          // Otro tipo de error
          this.showAlert('error', 'No se pudo cargar el usuario');
        }
        this.router.navigate(['/users']);
      }
    );
  }

  // Actualizar usuario
  onSubmit(): void {
    this.apiService.put(`users/${this.user.id}`, this.user, true).subscribe(
      (response) => {
        Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
        this.router.navigate(['/users']);
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
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