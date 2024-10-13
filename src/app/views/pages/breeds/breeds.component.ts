import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-breeds',
  templateUrl: './breeds.component.html',
  styleUrls: ['./breeds.component.scss']
})
export class BreedsComponent implements OnInit {

  @ViewChild('editModal') editModal!: TemplateRef<any>;

  breeds: any[] = [];  // Lista completa de razas
  species: any[] = [];  // Lista de especies para el select
  isLoading: boolean = true;  // Estado de carga
  actions: any[] = [];  // Acciones que se pueden realizar en la tabla
  newBreed: any = { breedName: '', species_id: null };  // Objeto para la nueva raza
  selectedBreed: any = null;  // Raza seleccionada para editar
  errors: any = {};  // Errores de validación

  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadBreeds();
    this.loadSpecies();
    this.setupActions();
  }

  // Cargar razas desde el API
  loadBreeds(): void {
    this.isLoading = true;
    this.apiService.get('breeds', true).subscribe(
      (response) => {
        if (response.success) {
          this.breeds = response.data
            .filter((breed: any) => breed.breedName)  // Filtrar razas válidas
            .sort((a: any, b: any) => b.id - a.id);  // Ordenar descendente por 'id'
          this.isLoading = false;
        }
      },
      () => {
        this.isLoading = false;
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las razas');
      }
    );
  }

  // Cargar especies para el dropdown
  loadSpecies(): void {
    this.apiService.get('species', true).subscribe(
      (response) => {
        if (response.success) {
          this.species = response.data;
        }
      },
      () => this.utilitiesService.showAlert('error', 'No se pudieron cargar las especies')
    );
  }

  // Configurar las acciones para la tabla
  setupActions(): void {
    this.actions = [
      {
        label: 'Editar',
        onClick: (breed: any) => this.openEditModal(breed),
        condition: (breed: any) => true  // Todas las filas pueden ser editadas
      },
      {
        label: 'Eliminar',
        onClick: (breed: any) => this.deleteBreed(breed.id), // Aquí pasamos solo el ID correctamente
        condition: (breed: any) => true  // Todas las filas pueden serz eliminadas
      }
    ];
  }

  openAddModal(content: TemplateRef<any>): void {
    this.newBreed = { breedName: '', species_id: null };
    this.errors = {};
    this.modalService.open(content);
  }

  // Abrir modal para agregar nueva raza
  openEditModal(breed: any): void {
    this.selectedBreed = { ...breed };
    this.errors = {};
    this.modalService.open(this.editModal);  // Ahora usamos el @ViewChild para abrir el modal
  }

  // Enviar formulario para agregar una nueva raza
  onSubmit(modal: any): void {
    this.apiService.post('breeds', this.newBreed, true).subscribe(
      (response) => {
        if (response.success) {
          this.breeds.push(response.data);
          this.newBreed = { breedName: '', species_id: null };
          this.errors = {};
          modal.close();
          this.utilitiesService.showAlert('success', 'Raza agregada correctamente.');
          this.loadBreeds();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la raza.');
        }
      }
    );
  }

  // Enviar formulario para editar una raza existente
  onEditSubmit(modal: any): void {
    this.apiService.put(`breeds/${this.selectedBreed.id}`, this.selectedBreed, true).subscribe(
      (response) => {
        if (response.success) {
          const index = this.breeds.findIndex(b => b.id === this.selectedBreed.id);
          if (index !== -1) {
            this.breeds[index] = response.data;
          }
          modal.close();
          this.utilitiesService.showAlert('success', 'Raza actualizada correctamente.');
          this.loadBreeds();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la raza.');
        }
      }
    );
  }

  // Eliminar una raza
  deleteBreed(id: string): void {
    this.utilitiesService.showConfirmationDelet('¿Estás seguro?', '¡Esta acción no se puede deshacer!')
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`breeds/${id}`, true).subscribe(
            (result) => {
              this.breeds = this.breeds.filter(breed => breed.id !== id);
              this.utilitiesService.showAlert('success', 'La raza ha sido eliminada.');
              this.loadBreeds();
            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar la raza.';
              this.utilitiesService.showAlert('error', errorMessage)
            }
          );
        }
      });
  }

}