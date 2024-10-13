import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  users: any[] = [];  // Lista completa de usuarios
  isLoading: boolean = true;  // Estado de carga
  actions: any[] = []; // Lista de acciones

  constructor(
    private apiService: ApiService,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.setupActions();
  }

  // Cargar usuarios desde el API
  loadUsers(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('users', true).subscribe(
      (response) => {
        if (response.success) {
          this.users = response.data.sort((a: any, b: any) => b.id - a.id);
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        this.utilitiesService.showAlert('error', 'No se pudieron cargar los usuarios');
      }
    );
  }

  // Definir las acciones para cada usuario
  setupActions(): void {
    this.actions = [
      {
        label: 'Editar',
        onClick: this.editUser.bind(this), // Pasamos la referencia de la función
        condition: (user: any) => user.id !== 1 // Condición para habilitar la acción
      },
      {
        label: 'Eliminar',
        onClick: this.deleteUser.bind(this), // Pasamos la referencia de la función
        condition: (user: any) => user.id !== 1 // Condición para habilitar la acción
      }
    ];
  }

  // Función para redirigir al formulario de edición
  editUser(user: any): void {
    const encodedId = btoa(user.id);
    this.router.navigate(['/users/edit', encodedId]);  // Redirige a la ruta de edición
  }

  // Función para eliminar un usuario
  deleteUser(user: any): void {
    if (user.id === 1) {
      this.utilitiesService.showAlert('warning', 'No se puede eliminar al usuario con ID 1');
    } else {
      // Aquí agregar lógica para eliminar al usuario
      this.utilitiesService.showAlert('success', 'Usuario eliminado correctamente');
    }
  }

}