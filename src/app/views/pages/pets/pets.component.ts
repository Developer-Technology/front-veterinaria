import { Component, ViewChild, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pets',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.scss']
})
export class PetsComponent implements OnInit {

  @ViewChild('loadingModal') loadingModal: any;  // Referencia al modal de carga

  pets: any[] = [];  // Lista completa de mascotas
  isLoading: boolean = true;  // Estado de carga
  actions: any[] = [];  // Lista de acciones
  serverUrl: string;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private utilitiesService: UtilitiesService,
    private modalService: NgbModal
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

  // Función para eliminar todas las notas relacionadas a una mascota
  deleteAllNotes(id: string): void {
    this.apiService.delete(`pets/${id}/notes/`, true).subscribe(
      (result) => { },
      (error) => { }
    );
  }

  // Eliminar una nota y actualizar la tabla
  deleteVaccines(id: string): void {
    this.apiService.delete(`pets/${id}/vaccine-history/`, true).subscribe(
      (result) => { },
      (error) => { }
    );
  }

  // Función para mostrar el modal de carga
  showLoadingModal(): void {
    this.modalService.open(this.loadingModal, { backdrop: 'static', keyboard: false });  // No permite cerrar al hacer clic fuera ni con el teclado
  }

  // Función para ocultar el modal de carga
  hideLoadingModal(): void {
    this.modalService.dismissAll();  // Cierra todos los modales abiertos
  }

  // Función para eliminar una mascota y sus notas
  deletePet(pet: any): void {
    this.utilitiesService
      .showConfirmationDelet('¿Estás seguro?', '¡Esta acción no se puede deshacer! Se eliminará la mascota con todos sus registros asociados.')
      .then((result) => {
        if (result.isConfirmed) {
          this.showLoadingModal();  // Mostrar el modal de carga antes de la operación

          this.apiService.delete(`pets/${pet.id}`, true).subscribe(
            (response) => {
              this.deleteVaccines(pet.id);
              this.deleteAllNotes(pet.id);
              this.hideLoadingModal();  // Ocultar el modal de carga cuando se complete la eliminación
              this.utilitiesService.showAlert('success', 'Mascota y registros asociados eliminados correctamente');
              this.loadPets(); // Actualizar la lista de mascotas
            },
            (error) => {
              this.hideLoadingModal();  // Ocultar el modal de carga en caso de error
              const errorMessage = error?.error?.message || 'No se pudo eliminar la mascota.';
              this.utilitiesService.showAlert('error', errorMessage);
            }
          );

        }
      });
  }

}