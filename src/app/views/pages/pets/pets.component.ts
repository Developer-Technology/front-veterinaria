import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pets',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.scss']
})
export class PetsComponent implements OnInit {

  @Input() imageUrl: string | null = null;

  pets: any[] = [];  // Lista completa de mascotas
  isLoading: boolean = true;  // Estado de carga
  actions: any[] = [];  // Lista de acciones
  serverUrl: string;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  ngOnInit(): void {
    this.loadPets();
    this.setupActions();
  }

  // Cargar mascotas desde el API
  loadPets(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('pets', true).subscribe(
      (response) => {
        if (response.success) {
          this.pets = response.data.sort((a: any, b: any) => b.id - a.id);
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las mascotas');
      }
    );
  }

  // Definir las acciones para cada mascota
  setupActions(): void {
    this.actions = [
      {
        label: 'Editar',
        onClick: this.editPet.bind(this),  // Pasamos la referencia de la función
        condition: (pet: any) => true  // Condición para habilitar la acción
      },
      {
        label: 'Eliminar',
        onClick: this.deletePet.bind(this),  // Pasamos la referencia de la función
        condition: (pet: any) => true  // Condición para habilitar la acción
      },
      {
        label: 'Perfil',
        onClick: this.viewPet.bind(this),  // Pasamos la referencia de la función
        condition: (pet: any) => true  // Condición para habilitar la acción
      }
    ];
  }

  // Función para redirigir al formulario de edición
  editPet(pet: any): void {
    const encodedId = btoa(pet.id);
    this.router.navigate(['/pets/edit', encodedId]);  // Redirige a la ruta de edición
  }

  // Función para redirigir al formulario del perfil
  viewPet(pet: any): void {
    const encodedId = btoa(pet.id);
    this.router.navigate(['/pets/view', encodedId]);  // Redirige a la ruta de edición
  }

  // Función para eliminar una mascota
  deletePet(pet: any): void {
    this.utilitiesService
      .showConfirmationDelet(
        '¿Estás seguro?',
        '¡Esta acción no se puede deshacer!'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`pets/${pet.id}`, true).subscribe(
            (response) => {
              this.utilitiesService.showAlert('success', 'Mascota eliminada correctamente');
              this.loadPets();
            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar la mascota.';
              this.utilitiesService.showAlert('error', errorMessage);
            }
          );
        }
      });
  }

}