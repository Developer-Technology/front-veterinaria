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

  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id') || ''; // Si es null, será ''
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
        }
      },
      (error) => {
        this.isLoading = false;  // Detener el estado de carga en caso de error
        Swal.fire('Error', 'No se pudo cargar el usuario', 'error');
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
  
}